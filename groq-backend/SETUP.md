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

---

# Adding more providers (keeping gpt-oss-120b running)

## Why
`gpt-oss-120b` is **open-weight**, so many companies host the identical model. Groq's free
tier allows only **8,000 tokens per minute** (prompt + completion together) and 200K/day for
that model, so during a busy evening the ladder used to give up on it and drop the teacher to
a weaker model. With a second and third host configured, the ladder retries **the same model
elsewhere** before it ever lowers quality.

You can see this in the AI Monitor: `INTENDED` vs `SERVED`. Green = the model we wanted ran.

## What to do for each provider

1. Create an account and an API key.
2. Apps Script → **Project Settings ▸ Script Properties ▸ Add** — use the exact property name
   from the table. No redeploy is needed after adding a property.
3. In `teachers.html`, find the `PROVIDERS` table and set that provider to `ready: true`.

| Provider | Script property | Notes |
|---|---|---|
| Cerebras | `CEREBRAS_API_KEY` | Free tier; by far the fastest for this model. **Start here.** |
| DeepInfra | `DEEPINFRA_API_KEY` | No free tier, but among the cheapest per token; pay-as-you-go. |
| Together | `TOGETHER_API_KEY` | Free starter credit. |
| Fireworks | `FIREWORKS_API_KEY` | Free starter credit. |
| OpenRouter | `OPENROUTER_API_KEY` | One key fans out to many hosts; useful as a catch-all. |
| Novita | `NOVITA_API_KEY` | Low cost. |

Order matters: the ladder tries hosts in the order listed in `MODELS[].providers`.

## Checking a provider works
Generate one paper, then open **AI Monitor ▸ Test all models**. A provider with no key
returns a clear `has no key configured` message and the ladder simply moves on — it is a
configuration gap, never an outage for the teacher.

## Model names differ per host
`PROVIDER_CONFIG[provider].models` translates our canonical name to whatever that host calls
it (Cerebras drops the `openai/` prefix, Fireworks wants a full `accounts/...` path). If a
call returns *model not found*, check the provider's model list and update that map — nothing
else about the request changes.

## Token ceilings
`PROVIDERS[x].maxOutput` in `teachers.html` is the largest completion we will request from
that host. Groq's is deliberately **6000**: asking for more on the free tier is rejected
outright as *Request too large*, which is one reason gpt-oss-120b was being skipped. Hosts
without an 8K/min cap are set far higher, which is also what lets a full 80-mark paper be
generated in a single call instead of being truncated.

---

# Adding a model WITHOUT redeploying

Every model test used to need a proxy redeploy, because the allowlist lived in the code.
It no longer does.

**Apps Script → ⚙️ Project Settings → Script Properties → Add:**

| Property | Value |
|---|---|
| `EXTRA_MODELS` | `qwen/qwen3.7-flash, deepseek/deepseek-v4-flash-0731` |

Comma-separated, spaces ignored. **Takes effect on the very next request — no redeploy.**

To block something in the built-in list, add `BLOCKED_MODELS` in the same format.
Blocking always wins, which is the safe way round.

The built-in list in `Code.gs` stays as the safety net so a leaked proxy URL still cannot run
arbitrary expensive models on your keys.
