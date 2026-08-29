# Roboden AI Teacher — Roadmap & Must-Do Checklist

> Living document. Everything decided/researched so far, plus what still has to happen
> before and after commercial launch. Tick items off as we implement them together.
>
> Last updated: 2026-08-29

---

# ▶ THE WORKING PLAN

We are touching too many things at once — UI, models, paper research, PDF/DOCX alignment, and
five toolbar tools that have never been properly tested. This is the order we work in, and
**why** that order. One phase at a time.

## The four principles that set this order

1. **Verify before building.** Several commits of fixes have never run on the live site. Every
   hour spent building on unverified work risks being wasted.
2. **Fix the measuring instrument before measuring.** We cannot judge whether a question is
   good while a weak fallback model is the one answering. Capacity comes *before* quality work,
   or every quality judgement is made against the wrong model.
3. **Buy information cheaply before committing.** One generation per tool costs minutes and
   replaces guesses about what is broken with facts. Do this before planning the tool work.
4. **Start long-lead items immediately.** Cashfree KYC and legal review depend on *other
   people's* time. They finish last but must start first — see TRACK B.

## The rule that keeps this from sprawling

> **Never build on top of unverified work.**
> A phase ends with evidence — a screenshot, a downloaded file, an AI Monitor row. No evidence,
> not done, do not start the next phase.

## The per-session ritual

1. Pick **one** item from the current phase.
2. I implement and self-verify (automated checks + browser).
3. **Surya tests on a real device.** This step has caught every serious bug so far — the leave
   button, the missing answer key, the login loop. My verification is not a substitute.
4. Commit, with the evidence described in the message.
5. Only then move on.

Anything found mid-phase that is not blocking goes into the backlog, **not fixed immediately**.
That is the discipline that stops the drift.

---

# TRACK A — the build sequence (one at a time)

## PHASE 0 — Deploy and verify what is already built ⬅ **WE ARE HERE**

Zero new code. There are several commits of fixes that have **never run in production**, so we
do not actually know they work. Everything else is blocked behind this.

**Surya:**
- [ ] Deploy `teachers.html` to roboden.in
- [ ] Redeploy the Apps Script proxy — the new one routes providers; the old one ignores the
      `provider` field entirely
- [ ] Run the smoke test in §7

**Confirm these specific failures are gone** (every one was reported by a real user):
- [ ] Google login no longer leaves the button on "LOG IN"; no refresh needed
- [ ] A brand-new account is never told "your free trial has ended"
- [ ] No raw error text reaches the teacher ("Unexpected token", "Unterminated string")
- [ ] Paper header: Class + Subject left, Max. Marks above Time right
- [ ] DOCX has no coloured section boxes and matches the PDF
- [ ] Maths renders properly — no `{1}{2}`, no `\theta`, no `45\°`
- [ ] General Instructions state the real question ranges and marks

**Done when:** the smoke test passes on desktop **and** mobile.

---

## PHASE 1 — Capacity: make gpt-oss-120b actually run

**The highest-leverage single action in the plan, and the reason it comes second.** Groq's free
tier allows 8,000 tokens per minute covering prompt *and* completion. That means:

- a full 80-mark paper cannot reliably complete at all, and
- during the evening rush the ladder falls back to a weaker model — so any quality
  judgement made now is a judgement of the *fallback*, not of the product.

Testing question quality before fixing this would waste the entire Phase 3 effort.

**Surya:** get **ONE** key first — **Cerebras** (cloud.cerebras.ai). Free tier, fastest host
for this model, and no 8K/min ceiling.

- [ ] Add `CEREBRAS_API_KEY` to the proxy's Script Properties
- [ ] Set `PROVIDERS.cerebras.ready = true` in `teachers.html`
- [ ] Generate a paper → **AI Monitor: INTENDED must equal SERVED** (green, not amber)
- [ ] Generate an **80-mark** paper → one call, no truncation, marks exact

Only once that is green, add more hosts (DeepInfra → Together → Fireworks → OpenRouter). Each
is key → Script Property → `ready: true`, no code. See `groq-backend/SETUP.md`.

**Done when:** ten consecutive generations show SERVED = gpt-oss-120b, including an 80-mark paper.

---

## PHASE 2 — Triage pass: find out what is actually broken (half a day)

**Generate one of each tool. Fix NOTHING. Write down what breaks.**

Right now the order of Phase 4 is a guess. This converts it into a fact for the cost of six
generations, and it is the cheapest information we will ever buy.

- [ ] Question Paper · Worksheet · Lesson Slides (PPT) · Lesson Plan · Teaching Aids · Prompt Library
- [ ] For each: generate → preview → export every format → open the file
- [ ] Record: does it generate, does it render, does it export, is the content usable
- [ ] Rank the five non-paper tools by (how broken) × (how much teachers will use it)

**Done when:** we have a written list of real defects, and Phase 4's order is set by evidence
instead of assumption.

---

## PHASE 3 — Question Paper: from "working" to "sellable"

This is the product people pay for. It gets finished before the other tools get attention —
and it is deliberately *after* Phase 1, so we are judging the real model.

It also comes before the other tools because they **share its code**: Worksheet uses the same
pipeline, Lesson Plan and Teaching Aids share the blocks renderer. Fixing this fixes parts of
them for free. The reverse is not true.

- [ ] **Board × class × subject sweep.** Generate and actually READ: CBSE 10 Maths, CBSE 10
      Science, CBSE 12 Physics, ICSE 10 Maths, State Board 9 Social, Class 5 EVS, one language.
      Are the questions real, on-syllabus, and worth their marks?
- [ ] **Marking scheme audit** — every question, including case-study sub-parts and OR
      alternatives, has an answer. This has been wrong before.
- [ ] **Answer correctness** — solve 5 maths questions by hand against the key.
- [ ] **PDF alignment** at compact / standard / booklet, multi-page, nothing cut at the right
      edge, no orphaned section headings.
- [ ] **DOCX fidelity** — looks like the PDF and stays editable in Word.
- [ ] **Print test** — print one on A4 and look at it on paper.

**Done when:** Surya would hand any of these to a real class without editing it.

---

## PHASE 4 — The other five tools, one at a time

Same treatment as Question Paper. Do not start the next tool until the current one is finished.
**Final order is set by the Phase 2 triage**; this is the default if triage finds nothing
surprising — ordered by how much each shares with already-tested code:

- [ ] **4.1 Worksheet** — shares the paper pipeline, so it should be closest to working.
      Check differentiation levels, answer key, exports.
- [ ] **4.2 Lesson Plan** — blocks renderer. Check 5E structure, NEP alignment, DOCX tables.
- [ ] **4.3 Teaching Aids** — same renderer. Check analogies are age-appropriate and genuinely Indian.
- [ ] **4.4 Lesson Slides (PPT)** — most likely to be badly broken: its own schema, renderer and
      exporter, none of it recently exercised. Check overflow, charts, images, theme, 16:9.
- [ ] **4.5 Prompt Library** — mostly static. Verify every entry loads its tool and none
      references a removed subject.

---

## PHASE 5 — Real equations in Word (LaTeX → OMML)

Word currently gets a Unicode approximation: `(1)/(2)` instead of a stacked fraction. The `docx`
library we **already load** ships full native equation support — `MathFraction`, `MathRadical`,
`MathSuperScript`, 30 classes, confirmed present. Nothing new to install.

- [ ] LaTeX → OMML for the common cases: fractions, roots, powers, subscripts, Greek, trig,
      ±, ≤ / ≥, degree
- [ ] Fall back to today's Unicode path for anything unsupported — never regress
- [ ] Verify in real Word / LibreOffice, not by reading XML

**Why here and not sooner:** it only matters once the questions are trustworthy, and it is a
large change to a format that is painful to debug. **Pull it forward if** teachers complain
about maths appearance in Word — that is the trigger.

---

## PHASE 6 — Chapter grounding (the hallucination problem)

See §4A. Languages are the real risk: the model invents chapter names and prescribed texts.
Maths, science and social are largely safe, so this flow must **skip them entirely** — no
friction where there is no problem.

- [ ] Fuzzy match + "did you mean?" confirmation
- [ ] Cheap pre-call grounding check with a summary the teacher confirms
- [ ] Two-choice fallback: upload the pages, or generate anyway — **always the teacher's call**

**Constraint until this ships:** do not market to language teachers. The failure is silent and
looks authoritative, which is the worst combination.

---

# TRACK B — start these NOW, in parallel

These are not code. They depend on other people's timelines, so starting them late is what
delays launch. Begin them during Phase 0 and let them run in the background.

- [ ] **Cashfree KYC** → production keys (takes days; blocks the first real payment)
- [ ] **Privacy Policy · Terms of Service · Refund & Cancellation policy** (DPDP Act 2023)
- [ ] **Consent notice at signup**, all four linked in the footer and at checkout
- [ ] **Firebase → Blaze plan**
- [ ] **Rotate the old leaked Groq key** `gsk_pSGj5M…`
- [ ] Decide the paid-tier position for any provider that may train on inputs

**Launch gate:** Track A through Phase 4 **and** all of Track B. One small real payment
end-to-end before announcing anything.

---

## Parked deliberately — do not start

Written down so they stop competing for attention:

- Side-by-side model comparison tool
- AI answer-key verifier (second pass that re-solves every question)
- Question bank / reuse across papers
- Stock images in PPTs
- Email OTP password reset
- Apps Script → Cloudflare Workers migration

---

# Reference — findings still open

### 🔴 Found by the health check (2026-08-29)
1. **The deployed Groq proxy rejects every rotation model** — `qwen3.8-27b`, `qwen3.6-27b`,
   `compound`, `compound-mini` all return *"Model not allowed"*. Rotation is therefore
   completely inactive: one rate limit = total failure. **Redeploy the proxy with the updated
   `ALLOWED_MODELS`.**
2. **Vision model was wrong — now fixed.** `meta-llama/llama-4-scout-…` does not exist on this
   account. Groq's multimodal models are the **qwen** ones (`qwen/qwen3.6-27b` = 5 images per
   request, `qwen/qwen3.8-27b` = 3), both with JSON mode. Vision now routes to qwen3.6-27b, so
   handwriting OCR works once the proxy allowlist is redeployed.
   - ⚠️ Each image costs **2048 input tokens** — multi-page uploads need the paid tier's higher
     tokens-per-minute ceiling (free tier is 8K/min; Developer plan is 250K/min).
   - ⚠️ **The qwen models are Groq "Preview"** — *"may be discontinued at short notice"*, so they
     should not be a commercial product's only path. Text generation degrades safely (rotation
     falls back to gpt-oss/compound), but **vision has no other Groq option** — get Gemini vision
     or Sarvam OCR as the stable path before selling the handwriting feature.

3. **Production vs Preview matters for the ladder.** Production: `gpt-oss-120b`, `gpt-oss-20b`,
   `compound`, `compound-mini`. Preview (discontinuable): `qwen3.6-27b`, `qwen3.8-27b`.
   Rotation makes this survivable for text; do not let preview models be a single point of failure.

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
│    ├─ English script → qwen/qwen3.6-27b ▸ qwen/qwen3.8-27b ▸ Gemini 2.5 Flash
│    └─ Indic script   → Sarvam OCR/Doc API ▸ Gemini 2.5 Flash ▸ qwen vision
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

## 4A. 📚 CHAPTER GROUNDING — the hallucination problem

### 4A.1 The problem
Chapters fall into two very different classes:

| Type | Example | Does the AI know it? |
|---|---|---|
| **Conceptual** | Linear Equations, Photosynthesis, Light–Reflection | ✅ Yes — universal knowledge |
| **Text-specific** | "Surya's Journey", a Telugu poem, a state-board prose piece | ❌ No — it has never read that text |

For text-specific chapters the AI **hallucinates**: it invents characters and plot and produces a
confident, perfectly-formatted paper **about a story that does not exist**. It fails *silently* —
the paper looks flawless; only the teacher discovers the content is wrong.

**Decision: textbook grounding is needed for LANGUAGE subjects only.** Maths/Science/Social
chapters are conceptual and generate reliably from the chapter name alone.

### 4A.2 Required flow — never generate blindly
```
Teacher types chapter name  (language subject)
      │
      ├─ Fuzzy-match against the known chapter list for board/class/subject
      │     ├─ close match  → "Did you mean 'Surya's Journey'?"  → confirm
      │     └─ several near matches → offer the list to pick from
      │
      ├─ Not in library → AI grounding check:
      │     "Do you know chapter X of <board> class <n> <subject>?" → {known, confidence, summary}
      │     └─ known → show the summary → "Is this the right chapter?" → confirm → generate
      │
      └─ Still unknown → DO NOT GUESS. Give the teacher two explicit choices:
            ① 📷 Upload textbook pages (photo → OCR → generate from the real text)
            ② ✨ Generate anyway from the title  (clearly labelled as AI's best guess)
```
- [ ] Fuzzy match + "did you mean?" confirmation
- [ ] AI grounding check (cheap pre-call) with summary confirmation
- [ ] Two-choice fallback (upload pages / generate anyway) — **teacher's call, never automatic**
- [ ] Skip the whole flow for maths/science/social (no friction where it isn't needed)

### 4A.3 Textbook digest library (languages only)
**Do NOT store whole textbooks.** Process each chapter **once, offline**, into a digest:
```json
{ "chapter":"...", "summary":"...", "characters":[...], "keyEvents":[...],
  "themes":[...], "importantPassages":[...], "vocabulary":[...] }
```
- Retrieval is a **direct key lookup** (`board/class/subject/chapter`) — the teacher already tells
  us exactly which chapter, so **no vector DB / embeddings / RAG needed**.
- ~5 KB per chapter · ~25 MB for 300 books · can live as static JSON on the web host.
- One-time digest generation ≈ **₹900 for ~4,500 chapters**; **₹0** per query afterwards.
- Adds only ~₹0.05 per paper (digest ≈ 1,200 tokens vs ~6,000 for raw chapter text).

⚠️ **Copyright:** storing *digests* (our own structured summaries) is far more defensible than
hosting verbatim textbook text. Government/NCERT and state-board free PDFs are the low-risk lane;
**never** ingest private publishers (Oswaal, S.Chand…). Teacher-uploaded pages remain the
universally safe path — that is the teacher's own fair use, not our redistribution.
**Get a lawyer's opinion before publishing a large stored library commercially.**

**Scope decided (2026-08-29):** languages = **English, Telugu, Kannada, Tamil, Malayalam, Hindi**.
Boards = **CBSE/NCERT first, then State (Telangana/AP)** — state boards matter most because the
AI genuinely does not know those texts.

---

## 5. 🧩 Feature backlog

### 5.1 Missing features
- [ ] **Language selector** in the form — *prerequisite for ALL Indic routing.*
      Options: English, Telugu, Kannada, Tamil, Malayalam, Hindi.
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
