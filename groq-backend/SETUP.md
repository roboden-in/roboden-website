# Roboden Groq Proxy — Setup (5 minutes)

This hides your Groq API key so it is **never** visible in `teachers.html` page source.
The browser talks to this Apps Script; the script adds the key and forwards to Groq.

## 1. Create the script
1. Go to <https://script.google.com> → **New project**.
2. Delete the default code, paste the contents of **`Code.gs`** from this folder.
3. Rename the project to `Roboden Groq Proxy`.

## 2. Store your Groq key as a script property (this is the secret vault)
1. In the Apps Script editor: **Project Settings** (gear icon) → scroll to **Script Properties** → **Add script property**.
2. Property name: `GROQ_API_KEY`
3. Value: your **new** Groq key from <https://console.groq.com/keys>
   > ⚠️ First **revoke the old key** `gsk_pSGj5M…` in the Groq console — it was exposed in the public site and must be treated as compromised. Create a fresh one for this property.
4. Save.

## 3. Deploy as a Web App
1. **Deploy** → **New deployment** → type **Web app**.
2. Description: `groq-proxy-v1`
3. Execute as: **Me**
4. Who has access: **Anyone**  *(required — the browser calls it without a Google login)*
5. **Deploy**, authorize the permissions prompt, and **copy the Web app URL**
   (looks like `https://script.google.com/macros/s/AKfyc…/exec`).

## 4. Wire it into the site
In `teachers.html`, find `GROQ_CONFIG` and replace the placeholder:

```js
proxyEndpoint: "https://script.google.com/macros/s/REPLACE_WITH_GROQ_PROXY_DEPLOYMENT_ID/exec",
```

with the Web app URL you copied. Commit and deploy the site.

## 5. Test
- Open the Web app URL directly in a browser → you should see `{"ok":true,"service":"Roboden Groq Proxy"}`.
- On the site, generate a question paper. It should work with **no key in the page source**.

## Notes
- **Model allowlist** and a **max_tokens cap** are built into `Code.gs` so a leaked proxy
  URL can't be abused to run expensive models or huge requests on your key.
- To update the key later, just change the `GROQ_API_KEY` script property — no redeploy needed.
- A teacher can still use their **own** Groq key (Profile ▸ Save Key); that path calls Groq
  directly from their browser and bypasses this proxy entirely.
