/**
 * ROBODEN — Free Demo Class Booking backend
 *
 * Runs as a Google Apps Script Web App attached to a Google Sheet.
 * The sheet stores every booking; this script enforces slot capacity
 * so two visitors can never overbook the same slot.
 *
 * See SETUP.md for deployment steps.
 */

// Trainers in priority order: the first free trainer in this list gets the student.
// Each trainer receives an email with a confirm button when a student is assigned.
// meetLink = that trainer's permanent meeting room (Google Meet / Zoom) — it is
// sent to the student when the trainer confirms.
var TRAINERS = [
  { name: 'Surya',   email: 'surya@roboden.in',   meetLink: 'https://meet.google.com/hiu-asvi-dwx' },
  { name: 'Sailaja', email: 'sailaja@roboden.in', meetLink: 'https://meet.google.com/PASTE-SAILAJA-LINK-HERE' }
];
// Seats per slot = number of trainers. If you add a trainer here, also set
// BOOKING_CAPACITY in online-training.html to the same number.
var SITE_BOOKING_URL = 'https://roboden.in/online-training.html';   // where students go to pick a new slot
var SHEET_NAME = 'Bookings';
var NOTIFY_EMAIL = '';            // optional: extra email that gets a copy of every booking
var VALID_TIMES = ['18:00', '19:00', '20:00'];   // 6, 7, 8 PM start times

function doGet(e) {
  var action = (e.parameter.action || '').toLowerCase();
  if (action === 'availability') {
    return json_(getCounts_(e.parameter.start, e.parameter.end));
  }
  if (action === 'confirm') {
    return confirmBooking_(e.parameter.id);
  }
  if (action === 'cancel') {
    return cancelBooking_(e.parameter.id);
  }
  return json_({ error: 'unknown action' });
}

function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, reason: 'bad request' });
  }

  // basic validation — need a name and at least one way to contact the student
  if (!data.date || !data.name || (!data.phone && !data.email) || VALID_TIMES.indexOf(data.time) === -1) {
    return json_({ ok: false, reason: 'missing fields' });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    return json_({ ok: false, reason: 'bad date' });
  }
  var day = new Date(data.date + 'T12:00:00').getDay();
  if (day === 0 || day === 6) {
    return json_({ ok: false, reason: 'weekend' });
  }

  // lock so two simultaneous bookings can't overfill a slot
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var trainer = freeTrainer_(data.date, data.time);
    if (!trainer) {
      return json_({ ok: false, reason: 'full' });
    }
    var id = Utilities.getUuid();
    sheet_().appendRow([
      new Date(),
      "'" + data.date,
      "'" + data.time,
      data.course || '',
      data.name,
      "'" + data.phone,
      data.email || '',
      data.grade || '',
      trainer.name,
      'Pending',
      id,
      data.contact === 'Email' ? 'Email' : 'WhatsApp'
    ]);
    notify_(data, trainer, id);
    // short reference the student sends back in their WhatsApp "Hi" message
    return json_({ ok: true, ref: refOf_(id) });
  } finally {
    lock.releaseLock();
  }
}

/* ── helpers ── */

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['Booked At', 'Date', 'Time', 'Course', 'Student Name', 'Phone', 'Email', 'Class/Grade', 'Trainer', 'Status', 'Booking ID', 'Contact Via']);
    sh.setFrozenRows(1);
  }
  return sh;
}

// first trainer (in TRAINERS order) not yet assigned in this slot, or null if slot is full
function freeTrainer_(date, time) {
  var rows = sheet_().getDataRange().getValues();
  var taken = {};
  for (var i = 1; i < rows.length; i++) {
    if (isCancelled_(rows[i])) continue;
    if (norm_(rows[i][1], false) === date && norm_(rows[i][2], true) === time) {
      taken[String(rows[i][8]).trim()] = true;
    }
  }
  for (var t = 0; t < TRAINERS.length; t++) {
    if (!taken[TRAINERS[t].name]) return TRAINERS[t];
  }
  return null;
}

// counts active bookings per "date|time" key within [start, end]
function getCounts_(start, end) {
  var rows = sheet_().getDataRange().getValues();
  var counts = {};
  for (var i = 1; i < rows.length; i++) {
    if (isCancelled_(rows[i])) continue;
    var date = norm_(rows[i][1], false);
    var time = norm_(rows[i][2], true);
    if (start && date < start) continue;
    if (end && date > end) continue;
    var key = date + '|' + time;
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function isCancelled_(row) {
  return String(row[9]).trim() === 'Cancelled';
}

// sheet cells may come back as Date objects — normalise to plain strings
function norm_(v, isTime) {
  if (v instanceof Date) {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), isTime ? 'HH:mm' : 'yyyy-MM-dd');
  }
  return String(v).trim();
}

function notify_(data, trainer, id) {
  var confirmUrl = ScriptApp.getService().getUrl() + '?action=confirm&id=' + id;
  var cancelUrl = ScriptApp.getService().getUrl() + '?action=cancel&id=' + id;
  var subject = 'New demo class booking — ' + data.name + ' (' + data.date + ' ' + data.time + ')';
  var details =
    'Assigned trainer: ' + trainer.name + '\n' +
    'Course: ' + (data.course || '') + '\n' +
    'Date: ' + data.date + '\n' +
    'Time: ' + data.time + '\n' +
    'Student: ' + data.name + ' (' + (data.grade || '') + ')\n' +
    'Phone: ' + (data.phone || '—') + '\n' +
    'Email: ' + (data.email || '—') + '\n' +
    'Wants confirmation via: ' + (data.contact === 'Email' ? 'Email' : 'WhatsApp') + '\n' +
    'Ref: ' + refOf_(id) + ' (the student may WhatsApp us this code to verify their number)';
  var body = details + '\n\nCONFIRM THIS CLASS:\n' + confirmUrl +
    '\n\nCAN\'T TAKE IT? CANCEL:\n' + cancelUrl +
    '\n\nConfirm sends the student your meeting link. Cancel frees the slot and asks the student to pick another one.';
  var htmlBody =
    '<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#222;">' +
    '<p><b>New demo class booking assigned to ' + trainer.name + '</b></p>' +
    '<table style="border-collapse:collapse;">' +
    row_('Course', data.course) + row_('Date', data.date) + row_('Time', data.time) +
    row_('Student', data.name + ' (' + (data.grade || '') + ')') +
    row_('Phone', data.phone || '—') + row_('Email', data.email || '—') +
    row_('Confirm via', data.contact === 'Email' ? 'Email' : 'WhatsApp') +
    row_('Ref', refOf_(id)) +
    '</table>' +
    '<p style="color:#777;font-size:12px;">If the student chose WhatsApp, they were asked to send us a "Hi" containing this Ref — reply in that chat to be sure the number is really theirs.</p>' +
    '<p style="margin:24px 0;">' +
    '<a href="' + confirmUrl + '" style="background:#6d28d9;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">&#9989; Confirm this class</a>' +
    '&nbsp;&nbsp;&nbsp;' +
    '<a href="' + cancelUrl + '" style="background:#4b4b55;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">&#10060; Cancel</a>' +
    '</p>' +
    '<p style="color:#777;font-size:12px;">Confirm emails the student your meeting link (plus a one-click WhatsApp message for you). Cancel frees the slot and asks the student to choose another one.</p>' +
    '</div>';
  try {
    MailApp.sendEmail(trainer.email, subject, body, { htmlBody: htmlBody });
    if (NOTIFY_EMAIL && NOTIFY_EMAIL !== trainer.email) {
      MailApp.sendEmail(NOTIFY_EMAIL, subject, body, { htmlBody: htmlBody });
    }
  } catch (err) {
    // never fail the booking because of a mail issue
  }
}

// short human-friendly reference derived from the booking ID (first uuid block)
function refOf_(id) {
  return String(id).split('-')[0].toUpperCase();
}

function row_(label, value) {
  return '<tr><td style="padding:4px 16px 4px 0;color:#777;">' + label + '</td><td style="padding:4px 0;"><b>' + (value || '') + '</b></td></tr>';
}

/* ── trainer clicks "Confirm" in their email ── */

function confirmBooking_(id) {
  if (!id) return page_('Invalid link', 'This confirmation link is incomplete.', null);
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sh = sheet_();
    var rows = sh.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (String(rows[i][10]) !== String(id)) continue;
      var b = {
        date:    norm_(rows[i][1], false),
        time:    norm_(rows[i][2], true),
        course:  String(rows[i][3]),
        name:    String(rows[i][4]),
        phone:   norm_(rows[i][5], false),
        email:   String(rows[i][6]).trim(),
        trainer: String(rows[i][8]).trim(),
        contact: String(rows[i][11] || 'WhatsApp').trim()
      };
      var trainer = trainerByName_(b.trainer) || TRAINERS[0];
      var waUrl = waConfirmLink_(b, trainer);
      if (String(rows[i][9]).trim() === 'Cancelled') {
        return page_('Booking was cancelled', 'This booking was already cancelled, so it can no longer be confirmed. The student was asked to pick another slot.', null);
      }
      if (String(rows[i][9]).trim() === 'Confirmed') {
        return page_('Already confirmed ✔', 'This booking was confirmed earlier. You can still resend the WhatsApp message below.', waUrl);
      }
      sh.getRange(i + 1, 10).setValue('Confirmed');
      var studentMailed = false;
      if (b.email) {
        try {
          MailApp.sendEmail(b.email,
            'Your free Roboden demo class is confirmed! 🎉',
            'Hi ' + b.name + '!\n\n' +
            'Your free demo class is confirmed:\n\n' +
            'Course: ' + b.course + '\n' +
            'Date: ' + b.date + '\n' +
            'Time: ' + b.time + '\n' +
            'Trainer: ' + trainer.name + '\n\n' +
            'Join here: ' + trainer.meetLink + '\n\n' +
            'Please join from a laptop with a good internet connection. See you in class!\n\n' +
            '— Team Roboden\nhttps://roboden.in');
          studentMailed = true;
        } catch (err) {}
      }
      var note;
      if (b.contact === 'WhatsApp' && waUrl) {
        note = 'The student chose <b>WhatsApp</b> confirmation — tap below to send them the meeting link:';
        if (studentMailed) note += '<br>(They were also emailed a copy.)';
      } else if (studentMailed) {
        note = 'The student chose <b>email</b> — the meeting link has been emailed to them automatically.' +
          (waUrl ? ' You can also send it on WhatsApp:' : '');
      } else {
        note = waUrl
          ? 'Please send the confirmation on WhatsApp:'
          : 'No contact details found for this student — check the sheet.';
      }
      return page_(
        'Booking confirmed ✔',
        b.name + ' · ' + b.course + '<br>' + b.date + ' · ' + b.time + '<br><br>' + note,
        waUrl
      );
    }
    return page_('Booking not found', 'This booking may have been cancelled (row deleted from the sheet).', null);
  } finally {
    lock.releaseLock();
  }
}

/* ── trainer clicks "Cancel" in their email ── */

function cancelBooking_(id) {
  if (!id) return page_('Invalid link', 'This cancellation link is incomplete.', null);
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sh = sheet_();
    var rows = sh.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (String(rows[i][10]) !== String(id)) continue;
      var b = {
        date:    norm_(rows[i][1], false),
        time:    norm_(rows[i][2], true),
        course:  String(rows[i][3]),
        name:    String(rows[i][4]),
        phone:   norm_(rows[i][5], false),
        email:   String(rows[i][6]).trim(),
        contact: String(rows[i][11] || 'WhatsApp').trim()
      };
      var waUrl = waCancelLink_(b);
      if (String(rows[i][9]).trim() === 'Cancelled') {
        return page_('Already cancelled', 'This booking was cancelled earlier and the slot is free again. You can still resend the WhatsApp message below.', waUrl);
      }
      sh.getRange(i + 1, 10).setValue('Cancelled');
      var studentMailed = false;
      if (b.email) {
        try {
          MailApp.sendEmail(b.email,
            'Please choose another slot for your Roboden demo class',
            'Hi ' + b.name + ',\n\n' +
            'We\'re really sorry — we can\'t take your demo class at the slot you booked:\n\n' +
            'Course: ' + b.course + '\n' +
            'Date: ' + b.date + '\n' +
            'Time: ' + b.time + '\n\n' +
            'Please pick another slot that works for you here:\n' + SITE_BOOKING_URL + '\n\n' +
            'Sorry for the inconvenience — see you in class soon!\n\n' +
            '— Team Roboden\nhttps://roboden.in');
          studentMailed = true;
        } catch (err) {}
      }
      var note;
      if (b.contact === 'WhatsApp' && waUrl) {
        note = 'The student chose <b>WhatsApp</b> — tap below to ask them to pick another slot:';
        if (studentMailed) note += '<br>(They were also emailed.)';
      } else if (studentMailed) {
        note = 'The student chose <b>email</b> — they have been emailed to pick another slot.' +
          (waUrl ? ' You can also tell them on WhatsApp:' : '');
      } else {
        note = waUrl
          ? 'Please tell the student on WhatsApp:'
          : 'No contact details found for this student — check the sheet.';
      }
      return page_(
        'Booking cancelled',
        b.name + ' · ' + b.course + '<br>' + b.date + ' · ' + b.time +
        '<br><br>The slot is free again. ' + note,
        waUrl
      );
    }
    return page_('Booking not found', 'This booking may have been removed from the sheet.', null);
  } finally {
    lock.releaseLock();
  }
}

// pre-filled WhatsApp message asking the student to rebook
function waCancelLink_(b) {
  var digits = b.phone.replace(/\D/g, '');
  if (digits.length === 10) digits = '91' + digits;
  if (!digits) return null;
  var msg = 'Hi ' + b.name + ', we\'re really sorry — we can\'t take your Roboden demo class at the slot you booked (' +
    b.date + ', ' + b.time + '). 🙏\n\n' +
    'Please pick another slot here: ' + SITE_BOOKING_URL + '\n\n' +
    'Sorry for the inconvenience — see you in class soon!\n— Team Roboden';
  return 'https://wa.me/' + digits + '?text=' + encodeURIComponent(msg);
}

function trainerByName_(name) {
  for (var i = 0; i < TRAINERS.length; i++) {
    if (TRAINERS[i].name === name) return TRAINERS[i];
  }
  return null;
}

// pre-filled WhatsApp message to the student with the meeting link
function waConfirmLink_(b, trainer) {
  var digits = b.phone.replace(/\D/g, '');
  if (digits.length === 10) digits = '91' + digits;
  if (!digits) return null;
  var msg = 'Hi ' + b.name + '! 🎉 Your free Roboden demo class is confirmed.\n\n' +
    '📚 ' + b.course + '\n📅 ' + b.date + '\n⏰ ' + b.time + '\n👩‍🏫 Trainer: ' + trainer.name + '\n\n' +
    '🔗 Join here: ' + trainer.meetLink + '\n\n' +
    'Please join from a laptop with good internet. See you in class!\n— Team Roboden';
  return 'https://wa.me/' + digits + '?text=' + encodeURIComponent(msg);
}

// small result page shown to the trainer after clicking Confirm
function page_(title, subHtml, waUrl) {
  var html =
    '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + title + ' — Roboden</title></head>' +
    '<body style="margin:0;background:#0a0912;font-family:Arial,sans-serif;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;">' +
    '<div style="max-width:420px;text-align:center;padding:40px 24px;">' +
    '<h2 style="margin:0 0 14px;">' + title + '</h2>' +
    '<p style="color:rgba(255,255,255,.65);line-height:1.7;">' + subHtml + '</p>' +
    (waUrl
      ? '<p style="margin-top:28px;"><a href="' + waUrl + '" target="_blank" rel="noopener noreferrer" style="background:#25D366;color:#fff;padding:13px 30px;border-radius:999px;text-decoration:none;font-weight:bold;">Send confirmation on WhatsApp</a></p>'
      : '') +
    '</div></body></html>';
  return HtmlService.createHtmlOutput(html)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
