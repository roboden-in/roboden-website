/**
 * ROBODEN — Certificate verification backend
 *
 * Attach this to the certificate Google Sheet (Extensions → Apps Script).
 * It answers a single lookup: "does this certificate ID exist?" — returning
 * only that one record, so the full student list is never exposed the way
 * a published CSV is.
 *
 * Expected sheet columns (first sheet tab, any order, matched by header):
 *   Certificate ID | Student Name | Course | Issue Date
 *
 * See SETUP.md for deployment steps.
 */

function doGet(e) {
  var id = String(e.parameter.id || '').trim().toUpperCase();
  // IDs look like RD-2026001; allow up to 20 chars for future formats
  if (!/^RD-[0-9A-Z-]{1,20}$/.test(id)) {
    return json_({ found: false });
  }

  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var rows = sh.getDataRange().getValues();
  var head = rows[0].map(function (h) { return String(h).trim().toLowerCase(); });
  var ci = head.indexOf('certificate id');
  var ni = head.indexOf('student name');
  var co = head.indexOf('course');
  var di = head.indexOf('issue date');
  if (ci === -1) {
    return json_({ found: false, error: 'sheet is missing a "Certificate ID" column' });
  }

  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][ci]).trim().toUpperCase() === id) {
      return json_({
        found: true,
        cert: {
          id:     String(rows[i][ci]).trim(),
          name:   ni === -1 ? '' : String(rows[i][ni]).trim(),
          course: co === -1 ? '' : String(rows[i][co]).trim(),
          date:   di === -1 ? '' : fmtDate_(rows[i][di])
        }
      });
    }
  }
  return json_({ found: false });
}

// date cells may come back as Date objects — format like the printed certificates
function fmtDate_(v) {
  if (v instanceof Date) {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'dd-MM-yyyy');
  }
  return String(v).trim();
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
