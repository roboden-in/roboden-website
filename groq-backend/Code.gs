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
var ALLOWED_MODELS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'meta-llama/llama-4-maverick-17b-128e-instruct'
];

// Optional: cap max_tokens so a single request can't be abused to burn credits.
var MAX_TOKENS_CAP = 8000;

function doPost(e) {
  try {
    var key = PropertiesService.getScriptProperties().getProperty('GROQ_API_KEY');
    if (!key) return json_({ error: 'Proxy not configured: missing GROQ_API_KEY script property.' }, 500);

    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (err) {
      return json_({ error: 'Invalid JSON body.' }, 400);
    }

    // Enforce model allowlist
    if (payload.model && ALLOWED_MODELS.indexOf(payload.model) === -1) {
      return json_({ error: 'Model not allowed: ' + payload.model }, 400);
    }
    if (!payload.model) payload.model = 'openai/gpt-oss-120b';

    // Cap token usage
    if (!payload.max_tokens || payload.max_tokens > MAX_TOKENS_CAP) {
      payload.max_tokens = MAX_TOKENS_CAP;
    }

    var res = UrlFetchApp.fetch(GROQ_ENDPOINT, {
      method: 'post',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + key },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    // Relay Groq's response (status + body) straight back to the browser.
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
