/**
 * ROBODEN — Groq AI Proxy backend
 *
 * Runs as a Google Apps Script Web App. Its ONLY job is to hold the Groq API key
 * server-side and forward chat/vision requests to Groq, so the key never appears
 * in teachers.html (which is public source on roboden.in).
 *
 * The browser POSTs the exact Groq chat-completions payload (as text/plain, to keep
 * it a "simple" CORS request). This script injects the Authorization header and
 * relays Groq's JSON response back unchanged.
 *
 * See SETUP.md for deployment steps.
 */

var GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

// Allowed models — a safety allowlist so a stolen proxy URL can't run arbitrary
// (expensive) models on your key. Keep in sync with GROQ_CONFIG in teachers.html.
// SECURITY ALLOWLIST — a permission SET, not a priority order.
// Actual model priority lives in ROUTE_RULES in teachers.html.
// Verified against console.groq.com/docs/models for this account.
var ALLOWED_MODELS = [
  // Production models
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  // Production systems — no daily token cap, high tokens/minute (the reserve tank)
  'groq/compound',
  'groq/compound-mini',
  // Preview models — ALSO the only multimodal/vision models on Groq (handwriting OCR).
  // ⚠️ Groq marks these "preview: may be discontinued at short notice".
  'qwen/qwen3.8-27b',
  'qwen/qwen3.6-27b'
];

// Optional: cap max_tokens so a single request can't be abused to burn credits.
var MAX_TOKENS_CAP = 16000;

/**
 * MULTI-PROVIDER ROUTING
 *
 * gpt-oss-120b is an OPEN-WEIGHT model, so many companies host the very same weights. When
 * Groq's free tier rate-limits us we would previously drop the teacher to a weaker model;
 * now we can run THE SAME MODEL at another host instead.
 *
 * Every provider below speaks the OpenAI /chat/completions dialect, so the browser sends one
 * unchanged payload plus a "provider" field, and this script picks the endpoint, the key and
 * the host's own spelling of the model name. Keys never leave the server.
 *
 * TO ADD A PROVIDER:
 *   1. Get an API key from that provider's dashboard.
 *   2. Apps Script → Project Settings → Script Properties → add the `keyProp` name below.
 *   3. In teachers.html, set that provider's `ready: true` in the PROVIDERS table.
 *   Nothing else changes — the routing ladder picks it up automatically.
 *
 * ⚠️ Model IDs are what each host publishes TODAY; check the provider's model list if a call
 *    returns "model not found". Everything else about the request stays identical.
 */
var PROVIDER_CONFIG = {
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    keyProp: 'GROQ_API_KEY',
    models: {}                                   // Groq uses our canonical names as-is
  },
  cerebras: {
    url: 'https://api.cerebras.ai/v1/chat/completions',
    keyProp: 'CEREBRAS_API_KEY',
    models: { 'openai/gpt-oss-120b': 'gpt-oss-120b', 'openai/gpt-oss-20b': 'gpt-oss-20b' }
  },
  deepinfra: {
    url: 'https://api.deepinfra.com/v1/openai/chat/completions',
    keyProp: 'DEEPINFRA_API_KEY',
    models: {}
  },
  together: {
    url: 'https://api.together.xyz/v1/chat/completions',
    keyProp: 'TOGETHER_API_KEY',
    models: {}
  },
  fireworks: {
    url: 'https://api.fireworks.ai/inference/v1/chat/completions',
    keyProp: 'FIREWORKS_API_KEY',
    models: { 'openai/gpt-oss-120b': 'accounts/fireworks/models/gpt-oss-120b',
              'openai/gpt-oss-20b':  'accounts/fireworks/models/gpt-oss-20b' }
  },
  openrouter: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    keyProp: 'OPENROUTER_API_KEY',
    models: {}
  },
  novita: {
    url: 'https://api.novita.ai/v3/openai/chat/completions',
    keyProp: 'NOVITA_API_KEY',
    models: {}
  }
};

function doPost(e) {
  try {
    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (err) {
      return json_({ error: 'Invalid JSON body.' }, 400);
    }

    // Which host should serve this? Default to Groq so older clients keep working unchanged.
    var providerName = payload.provider || 'groq';
    delete payload.provider;                     // never forward our own routing field upstream

    var cfg = PROVIDER_CONFIG[providerName];
    if (!cfg) return json_({ error: 'Unknown provider: ' + providerName }, 400);

    var key = PropertiesService.getScriptProperties().getProperty(cfg.keyProp);
    if (!key) {
      // A clear, specific message: this is a configuration gap, not an outage. The client
      // treats it as a failure for THIS host and rotates to the next one.
      return json_({ error: 'Provider ' + providerName + ' has no key configured (' + cfg.keyProp + ').' }, 500);
    }

    // Enforce the model allowlist BEFORE translating, so the list stays readable and a stolen
    // proxy URL still cannot run arbitrary (expensive) models on any of the keys.
    if (payload.model && ALLOWED_MODELS.indexOf(payload.model) === -1) {
      return json_({ error: 'Model not allowed: ' + payload.model }, 400);
    }
    if (!payload.model) payload.model = 'openai/gpt-oss-120b';

    // Translate to this host's spelling (Cerebras drops the "openai/" prefix, Fireworks uses
    // a full account path, and so on).
    if (cfg.models && cfg.models[payload.model]) payload.model = cfg.models[payload.model];

    // Cap token usage
    if (!payload.max_tokens || payload.max_tokens > MAX_TOKENS_CAP) {
      payload.max_tokens = MAX_TOKENS_CAP;
    }

    var headers = { 'Authorization': 'Bearer ' + key };
    // OpenRouter asks callers to identify themselves; it also improves rate-limit standing.
    if (providerName === 'openrouter') {
      headers['HTTP-Referer'] = 'https://roboden.in';
      headers['X-Title'] = 'Roboden AI Teacher';
    }

    var res = UrlFetchApp.fetch(cfg.url, {
      method: 'post',
      contentType: 'application/json',
      headers: headers,
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    // Relay the provider's response (status + body) straight back to the browser.
    return ContentService
      .createTextOutput(res.getContentText())
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return json_({ error: 'Proxy error: ' + (err && err.message ? err.message : err) }, 500);
  }
}

// Simple health check when the URL is opened in a browser.
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'Roboden Groq Proxy' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
