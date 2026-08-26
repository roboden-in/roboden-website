# Cashfree from scratch — a beginner's guide (for Roboden AI Teacher Pro)

You do **not** need to understand payments to do this. Follow the parts in order.
You can build and fully test **without any KYC or real money** using Test mode (Part A–C).
Only Part D (going live) needs business verification.

---

## Part A — Create your Cashfree account & get TEST keys  (~10 min, no KYC)

1. Go to **https://www.cashfree.com** → click **Sign Up** (top right).
2. Sign up with your **business email** and **phone number** → verify the OTP.
3. You'll land in the dashboard at **https://merchant.cashfree.com**.
4. **Switch to TEST mode.** Look at the **top of the dashboard** for a **Test / Production** toggle (sometimes labelled "Test Mode" or a sandbox switch). Make sure it says **TEST**. In test mode nothing is real — no KYC, no real money.
5. In the left menu open **Developers → API Keys**
   (if you don't see "Developers", look under **Payment Gateway → API Keys** / **Credentials**).
6. You'll see two values for the Test environment:
   - **App ID** (a.k.a. Client ID)
   - **Secret Key** (a.k.a. Client Secret) — click **Generate** / **View** / the eye icon to reveal it.
7. **Copy both.** Keep the Secret Key private (treat it like a password).

> If you can't find API Keys, use the dashboard **search bar** and type "API Keys".

---

## Part B — Put the keys into the backend

Open the Apps Script project you'll create from `Code.gs` (see `SETUP.md`), then in
**Project Settings ▸ Script Properties** add:

| Property | Value (for testing) |
|---|---|
| `CF_MODE` | `sandbox` |
| `CF_APP_ID` | *(your Test App ID)* |
| `CF_SECRET` | *(your Test Secret Key)* |
| `FIREBASE_DB_URL` | `https://roboden-python-lab-default-rtdb.asia-southeast1.firebasedatabase.app` |
| `FIREBASE_SECRET` | *(Firebase Console ▸ Project Settings ▸ Service accounts ▸ Database secrets)* |
| `SITE_URL` | `https://roboden.in/teachers` |

Then deploy the script as a Web App and paste its `/exec` URL into `PAY_CONFIG.endpoint`
in `teachers.html` (all detailed in `SETUP.md`).

---

## Part C — Test a payment (fake money)

1. On `teachers.html`, log in, open the upgrade box, click **Pay**.
2. Cashfree's checkout page opens. Pay with a **test card** (these only work in Test mode):

   | Method | Test value |
   |---|---|
   | Card number | `4111 1111 1111 1111` |
   | Expiry | any future date, e.g. `12/28` |
   | CVV | any 3 digits, e.g. `123` |
   | OTP (if asked) | `111000` (Cashfree sandbox OTP) |
   | Test UPI (success) | `testsuccess@gocash` |
   | Test UPI (failure) | `testfailure@gocash` |

   > Exact test values can change — the current list is on Cashfree's docs:
   > search "Cashfree test data" / "sandbox test cards". If `4111...` is rejected,
   > grab the latest success card from that page.
3. After paying, you return to the site and should become **PRO ACTIVE**.
   Check Firebase → `teacher_hub/<your-uid>/entitlement` shows `isPro: true`.

If that works, the whole payment flow is proven.

---

## Part D — Go live (accept real money) — needs KYC

Real payments require Cashfree to verify your business first.

1. In the dashboard, complete **KYC / Activation**. You'll be asked for:
   - Business/PAN details (a sole-proprietor / individual account is fine to start)
   - Bank account (where your ₹ settles)
   - GST is usually optional for small volumes
2. Cashfree reviews it (typically **1–3 working days**).
3. Once **activated**, switch the dashboard to **Production**, open **Developers → API Keys**
   again, and copy the **Production** App ID + Secret Key.
4. In Script Properties change:
   - `CF_MODE` → `production`
   - `CF_APP_ID` / `CF_SECRET` → the **Production** values
5. **Redeploy** the Apps Script (Deploy ▸ Manage deployments ▸ Edit ▸ New version).
6. Do one small **real** ₹ payment yourself to confirm, then you're live.

---

## Optional but recommended — Webhook (auto-confirm backup)

Even without this the site verifies each payment on return, but a webhook is a safety net
if a user closes the tab mid-redirect.

1. Dashboard → **Developers → Webhooks** → **Add Webhook Endpoint**.
2. URL: **`<your /exec URL>?webhook=1`**
3. Events: select **Payment Success** (and optionally Payment Failed).
4. Save. Cashfree will now also notify your backend server-to-server.

---

## Quick FAQ

- **Do I need a company?** No — you can start as an individual/sole proprietor. Test mode needs nothing.
- **Any fees?** Test mode is free. In production Cashfree charges a small per-transaction fee (they show current rates during onboarding).
- **Is my Secret Key ever exposed?** No — it lives only in the Apps Script Script Properties on Google's servers. It's never in the website source or shared with anyone.
- **UPI, GPay, PhonePe, cards, netbanking** all come enabled by default on the checkout.
