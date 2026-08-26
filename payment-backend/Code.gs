/**
 * ROBODEN — AI Teacher Pro: Payments & Entitlements backend
 *
 * Google Apps Script Web App. It is the ONLY thing allowed to grant "Pro":
 *   • create_order    → creates a Cashfree order (price read server-side, not trusted from client)
 *   • verify_payment  → checks Cashfree that the order is really PAID, then grants Pro
 *   • redeem_promo    → redeems a single-use workshop/promo code, then grants Pro
 *   • webhook (POST)  → Cashfree server-to-server confirmation (backup grant path)
 *
 * Entitlements are written to  teacher_hub/<uid>/entitlement  using the Firebase DB
 * secret, which bypasses security rules — so the browser can never write isPro itself.
 *
 * Configure everything in Script Properties (see SETUP.md):
 *   CF_APP_ID, CF_SECRET, CF_MODE (sandbox|production),
 *   FIREBASE_DB_URL (https://...firebasedatabase.app), FIREBASE_SECRET, SITE_URL
 */

function props_(){ return PropertiesService.getScriptProperties(); }
function cfg_(k){ return props_().getProperty(k); }
function cfBase_(){ return cfg_('CF_MODE') === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg'; }
function ONE_YEAR_MS(){ return 365 * 24 * 60 * 60 * 1000; }

function json_(obj){
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(){ return json_({ ok: true, service: 'Roboden Pro Payments', mode: cfg_('CF_MODE') || 'sandbox' }); }

function doPost(e){
  try {
    var body = {};
    try { body = JSON.parse(e.postData.contents); } catch (err) {}
    var action = body.action || '';

    if (action === 'create_order')   return json_(createOrder_(body));
    if (action === 'verify_payment') return json_(verifyPayment_(body));
    if (action === 'redeem_promo')   return json_(redeemPromo_(body));
    if (action === 'webhook' || (e.parameter && e.parameter.webhook)) return handleWebhook_(e);

    return json_({ error: 'Unknown action' });
  } catch (err) {
    return json_({ error: String(err && err.message ? err.message : err) });
  }
}

/* ── Pricing (authoritative, read from Firebase config) ── */
function currentPlan_(){
  var pricing = fbGet_('config/pricing') || {};
  var annual = Number(pricing.annual || 990);
  var launch = Number(pricing.launch || annual);
  var offer  = pricing.activeOffer || 'launch';
  var amount = offer === 'launch' ? launch : annual;
  return { amount: amount, currency: 'INR', label: offer === 'launch' ? 'Launch Offer' : 'Annual', days: 365 };
}

/* ── 1. Create a Cashfree order ── */
function createOrder_(body){
  if (!body.uid || !body.email) return { error: 'Missing user details' };
  var plan = currentPlan_();
  var orderId = 'ROB_' + Date.now() + '_' + Math.floor(Math.random() * 100000);

  var payload = {
    order_id: orderId,
    order_amount: plan.amount,
    order_currency: plan.currency,
    customer_details: {
      customer_id: body.uid,
      customer_email: body.email,
      customer_phone: String(body.phone || '9999999999')
    },
    order_meta: {
      return_url: (cfg_('SITE_URL') || 'https://roboden.in/teachers') + '?cf_order_id={order_id}'
    },
    order_note: 'Roboden AI Teacher Pro (' + plan.label + ')'
  };

  var res = UrlFetchApp.fetch(cfBase_() + '/orders', {
    method: 'post', contentType: 'application/json',
    headers: { 'x-client-id': cfg_('CF_APP_ID'), 'x-client-secret': cfg_('CF_SECRET'), 'x-api-version': '2023-08-01' },
    payload: JSON.stringify(payload), muteHttpExceptions: true
  });
  var data = JSON.parse(res.getContentText() || '{}');
  if (!data.payment_session_id) return { error: 'Cashfree order failed', detail: data };

  // Log the order (amount is trusted from here, not from the client)
  fbPut_('orders/' + orderId, { uid: body.uid, amount: plan.amount, days: plan.days, status: 'CREATED', createdAt: Date.now() });

  return { payment_session_id: data.payment_session_id, order_id: orderId, amount: plan.amount, mode: cfg_('CF_MODE') || 'sandbox' };
}

/* ── 2. Verify a payment (server-to-server) then grant Pro ── */
function verifyPayment_(body){
  var orderId = body.order_id;
  if (!orderId) return { error: 'Missing order_id' };
  var logged = fbGet_('orders/' + orderId);
  if (!logged) return { error: 'Unknown order' };
  if (logged.status === 'PAID') return { success: true, already: true };

  var res = UrlFetchApp.fetch(cfBase_() + '/orders/' + orderId, {
    method: 'get',
    headers: { 'x-client-id': cfg_('CF_APP_ID'), 'x-client-secret': cfg_('CF_SECRET'), 'x-api-version': '2023-08-01' },
    muteHttpExceptions: true
  });
  var data = JSON.parse(res.getContentText() || '{}');

  if (data.order_status !== 'PAID') return { success: false, status: data.order_status || 'UNKNOWN' };
  if (Number(data.order_amount) < Number(logged.amount)) return { error: 'Amount mismatch' };

  var expiry = grantPro_(logged.uid, logged.days, 'cashfree', orderId);
  fbPatch_('orders/' + orderId, { status: 'PAID', paidAt: Date.now() });
  return { success: true, proExpiry: expiry };
}

/* ── 3. Redeem a single-use promo / workshop pass ── */
function redeemPromo_(body){
  var uid = body.uid, code = String(body.code || '').trim().toUpperCase();
  if (!uid || !code) return { error: 'Missing code' };

  var pass = fbGet_('workshop_passes/' + code);
  if (!pass) return { error: 'Invalid promo code.' };
  if (pass.status && pass.status !== 'active') return { error: 'This code is no longer active.' };

  var capacity = Number(pass.capacity || 1);
  var redeemed = Number(pass.redeemedCount || pass.redeemed || 0);
  var by = pass.redeemedBy || {};
  if (by[uid]) return { error: 'You have already used this code.' };
  if (redeemed >= capacity) return { error: 'This code has reached its limit.' };

  // Mark redemption first (so a Pro grant is never given without consuming a slot).
  by[uid] = Date.now();
  var nowRedeemed = redeemed + 1;
  fbPatch_('workshop_passes/' + code, {
    redeemedCount: nowRedeemed,
    redeemedBy: by,
    status: nowRedeemed >= capacity ? 'exhausted' : 'active'
  });

  var days = Number(pass.durationDays || pass.duration || 365);
  var expiry = grantPro_(uid, days, 'promo:' + code, code);
  return { success: true, proExpiry: expiry, days: days };
}

/* ── 4. Cashfree webhook (backup confirmation) ── */
function handleWebhook_(e){
  try {
    var payload = JSON.parse(e.postData.contents || '{}');
    var data = payload.data || {};
    var order = data.order || {};
    var orderId = order.order_id;
    if (orderId && (data.payment && data.payment.payment_status === 'SUCCESS')) {
      var logged = fbGet_('orders/' + orderId);
      if (logged && logged.status !== 'PAID') {
        grantPro_(logged.uid, logged.days, 'cashfree-webhook', orderId);
        fbPatch_('orders/' + orderId, { status: 'PAID', paidAt: Date.now() });
      }
    }
  } catch (err) {}
  return json_({ ok: true });
}

/* ── Grant Pro (the only place isPro is set) ── */
function grantPro_(uid, days, source, ref){
  var existing = fbGet_('teacher_hub/' + uid + '/entitlement') || {};
  var base = (existing.isPro && existing.proExpiry && existing.proExpiry > Date.now()) ? existing.proExpiry : Date.now();
  var expiry = base + Number(days || 365) * 24 * 60 * 60 * 1000;
  fbPatch_('teacher_hub/' + uid + '/entitlement', {
    isPro: true, proExpiry: expiry, source: source, ref: ref, lastGrant: Date.now()
  });
  return expiry;
}

/* ── Firebase REST helpers (DB secret bypasses security rules) ── */
function fbUrl_(path){ return cfg_('FIREBASE_DB_URL').replace(/\/$/, '') + '/' + path + '.json?auth=' + cfg_('FIREBASE_SECRET'); }
function fbGet_(path){
  var r = UrlFetchApp.fetch(fbUrl_(path), { method: 'get', muteHttpExceptions: true });
  var t = r.getContentText(); return (t && t !== 'null') ? JSON.parse(t) : null;
}
function fbPatch_(path, obj){
  UrlFetchApp.fetch(fbUrl_(path), { method: 'patch', contentType: 'application/json', payload: JSON.stringify(obj), muteHttpExceptions: true });
}
function fbPut_(path, obj){
  UrlFetchApp.fetch(fbUrl_(path), { method: 'put', contentType: 'application/json', payload: JSON.stringify(obj), muteHttpExceptions: true });
}
