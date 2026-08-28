# Roboden AI Teacher — Roadmap & Must-Do Checklist

> Living document. Everything decided/researched so far, plus what still has to happen
> before and after commercial launch. Tick items off as we implement them together.
>
> Last updated: 2026-08-29

---

## 0. What the product is

`teachers.html` (served at **roboden.in/teachers**) — an AI copilot for school teachers:

| Tool | Output |
|---|---|
| Question Paper | Board-accurate exam paper + teacher marking scheme |
| Worksheet | Differentiated practice sheet |
| Lesson Slides (PPT) | Gamma-style deck (English only for now) |
| Lesson Plan | 5E-model plan |
| Teaching Aids | Analogy kit / classroom aids |
| Handwriting → Paper | Photo of handwritten questions → clean printable paper |

**Exports:** DOCX, PDF, PPTX — all built **in the browser** (zero AI tokens).
**Business model:** 7-day free trial → **₹300/year launch** (₹990 regular, shown as ₹25/month).

---

## 1. 🔴 MUST DO BEFORE COMMERCIAL LAUNCH

### 1.1 Infrastructure
- [ ] **Firebase → Blaze (pay-as-you-go) plan**
  *Why:* the free Spark plan caps **100 simultaneous connections**. Every visitor holds a
  live listener, so ~100 concurrent teachers breaks signups **before** any AI limit does.
  Cost at our volume is a few rupees/month. **Set a budget alert.**
- [ ] **Groq paid (Developer) plan** before selling at scale
  *Why:* free tier = ~44 generations/day on gpt-oss alone. Model rotation raises this to
  ~1,000/day, but daily-use features (lesson plans, slides) will still hit it. Set a spend cap.
- [ ] **Rotate the old leaked Groq key** `gsk_pSGj5M…` (was public in page source pre-rebuild)
- [ ] **Redeploy the Groq proxy** whenever `ALLOWED_MODELS` changes
  (Apps Script: *Deploy → Manage deployments → ✏️ Edit → New version* — keeps the same URL)

### 1.2 Legal / compliance (India — DPDP Act 2023)
Storing teacher names, emails, school details and uploaded photos makes us a **Data Fiduciary**.
- [ ] **Privacy Policy** — what we collect, why, retention, and that content is processed by
      third-party AI providers (Groq / Google / Sarvam) and Cashfree
- [ ] **Terms of Service**
- [ ] **Refund & Cancellation policy** (required by Cashfree/RBI for merchants)
- [ ] **Consent notice at signup**
- [ ] Link all of the above in the footer + checkout

### 1.3 Payments
- [ ] Complete **Cashfree KYC** → switch `CF_MODE` from `sandbox` to `production`
- [ ] Swap in **production** `CF_APP_ID` / `CF_SECRET`, redeploy payments script
- [ ] Do one small **real** payment end-to-end before announcing

### 1.4 Data privacy rule
- [ ] **If we adopt Gemini, use the PAID tier.**
  Google's **free** tier may use submitted content to improve their products, and human
  reviewers may see it. Teachers upload photos of their own papers — not acceptable on free tier.

---

## 2. 🟠 OBSERVABILITY (build before adding more providers)

**Rationale:** every serious bug in this project has been *silent*. Model rotation + prompt
caching fail quietly and only show up as cost/quality drift. Make it auditable.

### 2.1 Call trace — capture per generation
```
TOOL      question_paper
LANGUAGE  Telugu
SUBJECT   Mathematics (group: math)
ROUTE PLAN   intended → gemini-2.5-flash   ladder → gemini → sarvam → qwen3
EXECUTION    1. gemini  ❌ 429 (620ms)
             2. sarvam  ✅ served (3.2s) · 1,480 in / 3,510 out · cached 1,200
OUTPUT       ✅ 11 questions · 20/20 marks
VERDICT      ⚠️ SUCCEEDED ON FALLBACK (intended ≠ served)
```

- [ ] Split **route planning** from **execution**: `planRoute({tool, language, subjectGroup})`
      returns `{intended, ladder, reason}` — makes routing rules a readable table, not scattered ifs
- [ ] Log every attempt to Firebase `ai_logs/` (admin-read only)
- [ ] **Auto-prune logs older than 60 days** (keeps storage ~36 MB)

### 2.2 Admin map view
One row per generation — three unambiguous states:
- ✅ **green** — intended model served, user got output
- ⚠️ **amber** — output delivered, but from a *fallback* (quality risk — investigate)
- ❌ **red** — no output

A screen of amber = primary model broken **even though every teacher got a paper**.

- [ ] Map table + filters (tool / language / verdict)
- [ ] Today's token usage **by model** + estimated ₹ spend
- [ ] Cache-hit rate (if 0%, prompt caching isn't working)

### 2.3 Health check button ⬅ *run after every deploy*
- [ ] Pings every model in the ladder, shows green/red + latency.
      Catches wrong model IDs, un-redeployed proxy, bad keys in 5 seconds.

### 2.4 Live trace during generation (admin only)
- [ ] Show routing decisions in the loading panel while testing

---

## 3. 🎯 MODEL ROUTING STRATEGY (researched 2026-08-29)

### 3.1 Principle
**Best model first, always.** Rotate the *same* model across providers before dropping to a
lesser model. Quality order is fixed by capability; availability depends on which keys exist.

### 3.2 The branch map
```
GENERATION REQUEST
│
├─ PPT SLIDES  (English only — current scope)
│    └─ gpt-oss-120b ▸ Gemini 2.5 Flash ▸ Qwen3
│
├─ HANDWRITING OCR (image)
│    ├─ English script → Llama 4 Scout ▸ Gemini 2.5 Flash
│    └─ Indic script   → Sarvam OCR/Doc API ▸ Gemini 2.5 Flash ▸ Llama 4 Scout
│
└─ PAPER / WORKSHEET / LESSON PLAN
     ├─ ENGLISH
     │    ├─ Maths & numerical Science → gpt-oss-120b (HIGH reasoning) ▸ Gemini 2.5 Flash ▸ Qwen3
     │    └─ Other subjects            → gpt-oss-120b ▸ Gemini 2.5 Flash ▸ Qwen3
     └─ INDIC (te · kn · ta · ml · hi)
          ├─ Language & Social subjects → Sarvam-105B ▸ Gemini 2.5 Flash ▸ Qwen3
          └─ Maths & Science            → Gemini 2.5 Flash ▸ Sarvam-105B ▸ Qwen3
```

**Why Sarvam is #1 for Indic language subjects but #2 for Indic maths:** a Telugu literature
paper needs native fluency (Sarvam is purpose-built for native script + code-mixed Indic);
a Telugu maths paper needs fluency **and** correct algebra, where Gemini 2.5 Flash is stronger
overall (top-rated on Hindi/Telugu **and** 72% AIME).

**Qwen3-27b is 3rd everywhere** — it's a 27B model against a 120B and Gemini Flash. Its role is
the overflow tank (it has the biggest token budget: 2M/day), used exactly when better models
are rate-limited.

### 3.3 Provider ladder per model
| Model | Providers, in order |
|---|---|
| gpt-oss-120b | Groq → **Cerebras** → Together → Fireworks → OpenRouter |
| Gemini 2.5 Flash | Google AI Studio (**paid tier**) → OpenRouter |
| Qwen3-27b | Groq → Cerebras → OpenRouter |
| Sarvam-105B | Sarvam API |

### 3.4 ⚡ The maths-accuracy fix (high value)
Wrong answer keys (e.g. `x = 5/3` when it's `x = 3`) are **caused by `reasoning_effort: 'low'`**,
which we were forced into by the 8K tokens/min limit. gpt-oss-120b is only strong at maths at
**HIGH** reasoning.
- [ ] Route **maths papers** to models with token headroom (`groq/compound` = 70K TPM,
      no daily cap; or Cerebras) and run them at **high reasoning**

### 3.5 Free keys still needed
- [ ] **Cerebras** — cloud.cerebras.ai (free tier, fastest gpt-oss-120b host)
- [ ] **Google AI Studio** — aistudio.google.com/apikey (use **paid** tier in production)
- [ ] **Sarvam** — dashboard.sarvam.ai (₹1,000 free credits, never expire)

### 3.6 Side-by-side comparison tool
- [ ] Admin-only mode: generate the **same** paper across gpt-oss / Gemini / Qwen / Sarvam and
      show outputs side by side — **final ladder order set by Surya's judgement, not benchmarks.**
      Must include a Telugu case and a maths case.

---

## 4. 💰 Cost model

**Exports cost ₹0** — DOCX/PDF/PPTX are built in the browser. 100% of AI cost is generation.

| Item | Cost |
|---|---|
| One generation | ~4,000–5,000 tokens |
| Sarvam-105B per paper | **~₹0.30** (₹0.27 with prompt caching) |
| Groq (paid) per paper | **~₹0.19** |
| Active teacher (~350 gens/yr) | **₹60–105/yr** |
| Revenue per teacher | **₹300/yr** |
| **Margin** | **~65–80%** |

Break-even ≈ 1,000 Indic papers/teacher/year — unreachable, and the daily cap bounds it anyway.

**Cost levers:** prompt caching (62% off input on Sarvam), cheap-tier routing for simple jobs,
lower default slide counts, and testing **Sarvam-30B** (much cheaper than 105B) for lighter tasks.

---

## 5. 🧩 Feature backlog

### 5.1 Missing features
- [ ] **Language selector** in the form — *prerequisite for ALL Indic routing.*
      Right now a teacher literally cannot request a Telugu paper.
- [ ] **Subjects list rework** (Surya to provide the list)
- [ ] Phase-by-phase **wizard** for question paper (spec handed to Gemini; I integrate + wire
      the `paperSource = custom` paste-questions path)
- [ ] **Stock images in PPTs** (Unsplash/Pexels free API — AI picks keywords, we embed).
      *Note:* no text LLM generates images; our shape/chart diagram engine already covers
      the "diagram" case and is often better for teaching.

### 5.2 Parked
- [ ] **Email OTP** for password reset (currently a secure reset *link*, which is standard.
      True 6-digit OTP needs a custom backend build.)
- [ ] **AI answer-key verifier** — 2nd AI pass that re-solves each question and corrects the key.
      Slot is already wired: flip `AI_VERIFY = true`. Needs paid tier (doubles calls).
- [ ] **Question bank** — store generated questions per board/class/subject/chapter and assemble
      papers from the bank (near-zero tokens, instant, quality compounds). Deferred: model
      rotation gives enough runway, and the bank is a large build.
- [ ] **Multi-provider proxy** (see §3) — the proxy must hold every provider key server-side

### 5.3 Infrastructure (later)
- [ ] Migrate proxies **Apps Script → Cloudflare Workers**
      *Why:* Apps Script allows only ~30 concurrent executions and has no SLA. Fine for launch
      and the first few hundred teachers; not a long-term production backend.

---

## 6. ⚠️ HARD-WON TECHNICAL RULES (do not repeat these bugs)

1. **Only use CDNs that are in the `_headers` CSP** — jsdelivr / cdnjs / gstatic.
   `unpkg.com` is **not** allowed. Lucide loaded from unpkg was blocked on the live site, and the
   unguarded `lucide.createIcons()` at startup threw and **killed the whole page init**
   (form never rendered). Always guard: `if(window.lucide) lucide.createIcons();`

2. **html2pdf: the element passed to `.from()` must be in NORMAL FLOW.**
   html2pdf clones it into its own wrapper to measure it; an element that is itself
   `position:fixed/absolute` collapses to **zero height** → 794×0 canvas → **blank white PDF**.
   Hide it with an out-of-flow *clipped wrapper* instead, and use **mm/A4** units (px units
   break pagination).

3. **Apps Script code changes need a NEW VERSION deployed.** Saving does nothing.
   Also: "Who has access" must be **Anyone** (not "Anyone with Google account").
   A healthy public web app 302-redirects to `script.googleusercontent.com`;
   a 403 or a login page means it's not public.

4. **The proxy relays errors as HTTP 200 with an `{error}` body.** Always inspect the body,
   not just `res.ok`, or rate limits look like empty responses.

5. **gpt-oss is a reasoning model** — hidden reasoning counts as output tokens. `max_tokens`
   must leave room or `finish_reason: 'length'` returns **empty content**.

6. **Groq rate limits are per model**, so rotating models multiplies capacity.
   `groq/compound` + `compound-mini` have **no daily token cap** and 70K TPM — the reserve tank.

7. **Run the orphan sweep after any big edit** — regex for `on*="fn("` handlers with no
   `function fn` definition, and `getElementById('x')` with no matching `id="x"`.
   This found: the broken login modal, undefined `closeModals`, the orphaned admin modal,
   and the entirely dead teacher profile modal.

8. **Keep the system prompt 100% static** (no interpolated values) so Groq prompt caching
   applies — cached tokens are exempt from rate limits.

9. **All form fields must exist in the DOM at all times.** `collectPaperParams()` reads ~15
   fields at generate time; if a wizard step is unmounted, it silently falls back to defaults
   and produces a wrong paper **with no error**.

---

## 7. ✅ Post-deploy smoke test

Run after every deploy:
- [ ] Page loads, **form is visible immediately** (no tab-switch needed)
- [ ] Generate button shows its ⭐ icon (proves lucide loaded / CSP OK)
- [ ] **Health check** — all models green
- [ ] Log in (Google **and** email/password) → badge shows correct state
- [ ] Generate a paper → marks total correctly
- [ ] Download **PDF** (must have content + correct page count), **DOCX**, **PPTX**
- [ ] Admin account → ADMIN badge, workshop-QR button visible, uncapped
- [ ] Promo code redeem works
- [ ] Mobile: login popup works (redirect flow), layout has no horizontal scroll

---

## 8. Reference — accounts & endpoints

| Thing | Where |
|---|---|
| Groq proxy (AI) | Apps Script — `AKfycbwiUQ3OH…` |
| Payments backend | Apps Script — `AKfycbx6VNBQdpMqu…` |
| Firebase project | `roboden-python-lab` (Realtime Database, asia-southeast1) |
| Backend Google account | roboden.in@gmail.com |
| Admin emails | `surya@roboden.in`, `roboden.in@gmail.com` |
| Groq limits page | console.groq.com/settings/limits |
| Setup guides | `groq-backend/SETUP.md`, `payment-backend/SETUP.md`, `payment-backend/CASHFREE_GUIDE.md` |
