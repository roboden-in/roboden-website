# Booking backend setup (one-time, ~10 minutes, free)

The booking widget on `online-training.html` needs a small backend so that
slots fill up for **all** visitors (not just one browser). We use a free
Google Sheet + Google Apps Script for this. Every booking becomes a row in
your sheet.

Until you finish these steps, the widget runs in **test mode** (bookings are
saved only in the visitor's own browser, and a small "test mode" note shows
in the popup).

## Steps

1. **Create the sheet**
   - Go to [sheets.new](https://sheets.new) (logged in with your Google account).
   - Name it `Roboden Bookings`.

2. **Add the script**
   - In the sheet: **Extensions → Apps Script**.
   - Delete whatever is in the editor and paste the full contents of
     [`Code.gs`](Code.gs).
   - In the `TRAINERS` list at the top, **paste each trainer's real meeting
     link** (`meetLink`) — e.g. your permanent Google Meet room. This link is
     sent to the student when the trainer confirms.
     To get a permanent Meet room: [meet.google.com](https://meet.google.com)
     → "New meeting" → "Create a meeting for later" → copy the link.
   - Bookings are assigned in list order: the **first** student in a slot
     goes to **Surya** (surya@roboden.in), the **second** goes to
     **Sailaja** (sailaja@roboden.in).
   - (Optional) Set `NOTIFY_EMAIL = 'your@email.com'` to also get a copy of
     every booking, regardless of trainer.
   - Save (Ctrl+S).

3. **Deploy as a web app**
   - Click **Deploy → New deployment**.
   - Click the gear icon next to "Select type" → choose **Web app**.
   - Settings:
     - Description: `roboden booking`
     - Execute as: **Me**
     - Who has access: **Anyone**  ← important, otherwise the website can't reach it
   - Click **Deploy**, approve the permissions (Google will warn because it's
     your own unverified script — click *Advanced → Go to … (unsafe)* → Allow).
   - Copy the **Web app URL** (ends with `/exec`).

4. **Connect the website**
   - Open `online-training.html`, find this line in the script section:
     ```js
     const BOOKING_API_URL='';   // ← paste your Google Apps Script Web App URL here
     ```
   - Paste the URL between the quotes:
     ```js
     const BOOKING_API_URL='https://script.google.com/macros/s/AKfy.../exec';
     ```
   - Upload the updated file to your hosting. Done — the "test mode" note
     disappears and bookings now go to your sheet.

## How a booking flows

1. Student books a slot on the website → the seat is held **instantly** with
   status **Pending**. A pending booking already counts against the 2 seats,
   so other students can never grab the same seat while a trainer takes time
   to confirm. While booking, the student chooses **WhatsApp or email** for
   their confirmation (the required field changes accordingly, and the choice
   is saved in the sheet's "Contact Via" column).
2. The assigned trainer gets an email with the student's details and two
   buttons: **"✅ Confirm this class"** and **"❌ Cancel"**.
3. **Confirm** → status changes to **Confirmed**, the student is
   automatically emailed the trainer's meeting link (if they gave an email),
   and the trainer gets a one-click **"Send confirmation on WhatsApp"**
   button with a pre-written message containing the meeting link.
4. **Cancel** → status changes to **Cancelled**, the slot instantly frees up
   on the website, and the student is automatically emailed an apology with
   a link to pick another slot (plus a one-click WhatsApp version for the
   trainer to send).

The buttons work from any device without logging in — each link contains a
unique unguessable booking ID. A cancelled booking can't be confirmed
afterwards by mistake.

## Wrong numbers & spam safety

Students can mistype their WhatsApp number, and messaging a stranger's number
can get your number reported as spam. Three protections are built in:

1. The form **validates the number format** (Indian mobile: 10 digits
   starting 6–9, with or without +91/0) before accepting the booking.
2. After booking, WhatsApp-preferring students see a **"Confirm your number —
   send us a 'Hi' on WhatsApp"** button. It opens WhatsApp on *their* phone
   with a pre-written message containing their booking details and a short
   **Ref code** (also shown in your booking email). A message they send
   themselves can't come from a wrong number.
3. **Best practice for trainers:** when the student's "Hi" arrives, reply in
   that same chat — replying to an existing chat can never be marked as spam.
   Only use the confirm page's WhatsApp button for students who didn't send
   the "Hi", and glance at the profile name before sending.

## Changing things later

| What | Where |
|---|---|
| Trainers / emails / assignment order | `TRAINERS` list in `Code.gs`. Adding a 3rd trainer? Also raise `BOOKING_CAPACITY` in `online-training.html` to 3 (keep it equal to the number of trainers) |
| Slot timings | `VALID_TIMES` in `Code.gs` **and** `BOOKING_SLOTS` in `online-training.html` |
| How many weeks ahead users can book | `BOOKING_MAX_WEEKS` in `online-training.html` |
| Cancel a booking | Click **Cancel** in the booking email (notifies the student), or set its Status cell to `Cancelled` / delete the row in the sheet (silent) |
| Website link sent to students on cancel | `SITE_BOOKING_URL` in `Code.gs` |

## Note on script changes

If you ever edit `Code.gs` again, use **Deploy → Manage deployments → ✏ Edit
→ Version: New version → Deploy** so the same URL keeps working (a *new*
deployment would create a different URL).
