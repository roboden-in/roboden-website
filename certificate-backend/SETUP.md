# Certificate verification backend setup (one-time, ~10 minutes, free)

Today `verify.html` reads the certificate sheet through a **published CSV
link** — which means anyone can download the entire student list from the
page source. This script replaces that with a lookup that returns **one
record per query**, keeping the list private.

Printed certificates are not affected: the QR-code URL, the certificate IDs,
and what students see all stay exactly the same.

## Steps — do them in this order (no downtime)

1. **Add the script**
   - Open the certificate Google Sheet (the one with Certificate ID /
     Student Name / Course / Issue Date columns).
   - **Extensions → Apps Script** → delete the editor contents and paste the
     full contents of [`Code.gs`](Code.gs) → Save.

2. **Deploy as a web app**
   - **Deploy → New deployment** → gear icon → **Web app**.
   - Execute as: **Me** · Who has access: **Anyone**.
   - Deploy, approve permissions, copy the **Web app URL** (ends in `/exec`).

3. **Connect the website**
   - In `verify.html`, find:
     ```js
     const VERIFY_API_URL = '';   // ← paste your certificate Apps Script URL here
     ```
     and paste the URL between the quotes. Commit and sync.
   - Until you do this, the page keeps using the old CSV — nothing breaks.

4. **Test on the live site**
   - Open `roboden.in/verify.html`, enter a real certificate ID, and confirm
     the green Verified card shows with correct details.
   - Also scan the QR code on one printed certificate to be sure.

5. **Only after the test passes — stop the public CSV**
   - In the certificate sheet: **File → Share → Publish to web →
     Stop publishing**.
   - The old bulk-download link now returns nothing, and the student list is
     private. Verification keeps working through the script.

## Notes

- New certificates: just add a row to the sheet — instantly verifiable.
- The script reads the **first sheet tab** and finds columns by their header
  names, so column order doesn't matter.
- If you later edit this script, redeploy with **Deploy → Manage deployments
  → ✏ Edit → New version → Deploy** to keep the same URL.
