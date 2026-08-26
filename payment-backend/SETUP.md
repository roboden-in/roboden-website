# Roboden AI Teacher Pro — Payments Backend Setup

This Apps Script is the **only** thing that can grant Pro. It verifies Cashfree payments
server-side and redeems promo codes, then writes entitlements to Firebase with the DB
secret (so the browser can never self-grant Pro).

## 1. Create the script
1. <https://script.google.com> → **New project** → paste `Code.gs` from this folder.
2. Rename it `Roboden Pro Payments`.

## 2. Script Properties (Project Settings ▸ gear ▸ Script Properties)
| Property | Value |
|---|---|
| `CF_MODE` | `sandbox` while testing, `production` when live |
| `CF_APP_ID` | Cashfree App ID (from Cashfree Dashboard ▸ Developers ▸ API Keys) |
| `CF_SECRET` | Cashfree Secret Key |
| `FIREBASE_DB_URL` | `https://roboden-python-lab-default-rtdb.asia-southeast1.firebasedatabase.app` |
| `FIREBASE_SECRET` | Firebase DB secret (see step 3) |
| `SITE_URL` | `https://roboden.in/teachers` |

## 3. Get the Firebase DB secret
Firebase Console ▸ Project Settings ▸ **Service accounts** ▸ **Database secrets** ▸ *Show* / *Add secret*.
Copy it into `FIREBASE_SECRET`. (If "Database secrets" is hidden, click the ⋮ / "Legacy" toggle — it is deprecated but still works. A service-account upgrade can come later.)

## 4. Deploy as Web App
**Deploy ▸ New deployment ▸ Web app** → Execute as **Me** → Who has access **Anyone** → Deploy → copy the `/exec` URL.

## 5. Wire the URL into the site
In `teachers.html`, set `PAY_CONFIG.endpoint` to the `/exec` URL you copied.

## 6. Cashfree webhook (recommended, optional)
Cashfree Dashboard ▸ Developers ▸ **Webhooks** ▸ add:
`<your /exec URL>?webhook=1`  (event: *Payment Success*). This is a backup; the site also
verifies each payment directly on return.

## 7. Test (sandbox first)
1. Keep `CF_MODE=sandbox`. On the site, sign in and click **Upgrade / Pay**.
2. Use Cashfree **test cards** to complete a sandbox payment.
3. You should return to the site as **Pro**. Check `teacher_hub/<uid>/entitlement` in Firebase.
4. Test a promo: create a Workshop Pass in `admin.html`, then redeem the code on `teachers.html`.
5. When happy, switch `CF_MODE=production` and redeploy (new version).

## Security notes
- The **amount is decided server-side** from `config/pricing` — the client cannot pay less.
- `isPro` is written only here; DB rules (`teacher_hub/$uid/entitlement`) forbid client writes.
- Promo redemption consumes a slot **before** granting Pro, and blocks re-use per user.
