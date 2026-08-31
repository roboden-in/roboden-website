# Maths paper audit — gpt-oss-120b on OpenRouter (2026-08-31)

Six papers generated, CBSE Class 10 · Mathematics · Trigonometry, at 10/20/25/40/50/80 marks.
All completed, exact marks, complete answer keys, scores 92–100 on our own scoring.

## What is GOOD

- Question style is genuinely board-like: applied word problems with Indian contexts
  ("Ravi, a farmer from Punjab, wants to install a solar panel…", kite festival in Jaipur).
- Distractors are plausible and reflect real student errors, not filler.
- Every question carries an answer, a worked solution, a Bloom level and a difficulty.
- Assertion-Reason and case-study items render correctly even without a `text` field —
  the assertion/reason pair and the case passage carry the question.
- Marks land exactly at every size (10/20/25/40/50/80).

## 🔴 THE REAL PROBLEM — off-syllabus content

CBSE Class 10 trigonometry covers ONLY: trigonometric ratios, values at 0°/30°/45°/60°/90°,
the identity sin²+cos²=1, complementary angles, and heights & distances.

It does NOT include compound angles, double-angle formulas, the sine/cosine rule, angles
beyond 90°, or inverse trigonometry. Those are Class 11 and 12.

| Paper | Questions | Off-syllabus | Share |
|---|---|---|---|
| 10 marks | 8 | 1 | 13% |
| 20 marks | 13 | 3 | 23% |
| 25 marks | 16 | **8** | **50%** |
| 40 marks | 23 | 5 | 22% |
| 50 marks | 30 | **11** | **37%** |
| 80 marks | 39 | 8 | 21% |

Actual examples produced for a **Class 10** paper:

- `Find tan 75°` · `Find sin 15°` · `Express cos 75° in exact surd form` — compound angles
- `If sin A = 5/13 and cos B = 12/13, find sin(A+B)` — angle-sum formula
- `Prove sin 2θ = 2 sin θ cos θ` · `Derive cos 2θ = 1 − 2sin²θ` — double angle
- `Using the cosine rule, find side c when a=8, b=6, ∠C=120°` — cosine rule
- `Area = ½ab·sin C` with an included angle — Class 11
- `θ = tan⁻¹(0.6) ≈ 31.8°` — inverse trigonometry, Class 12
- `What is cos 150°?` · `cos θ = −½ in quadrant II` — angles beyond 90°

One question was not trigonometry at all: *"60% of students like Mathematics, 45% like
Science and 30% like both…"* — that is Sets.

## Conclusion

**The model is not the problem. The missing syllabus data is.** gpt-oss-120b writes good
questions; it simply does not know what Class 10 covers, because we never tell it. No amount
of model comparison or prompt tuning fixes this — a teacher handed a paper where a third of
the questions are from a later class will not use the tool twice.

This is exactly the "curriculum accuracy" row in the technical-layers document, and it is the
strongest argument for building the chapter/syllabus database next.

## Correction to an earlier claim

I reported that some questions printed as "undefined". That was a bug in my own debug dump,
not in the product — the renderer already guards with `q.text || ''`, and Assertion-Reason and
case-study items render correctly. No product fix was needed.

---

# Head-to-head: gpt-oss-120b vs gemini-3.7-flash (2026-08-31)

Identical prompt, identical paper: CBSE Class 10 Mathematics, Trigonometry, 40 marks.

| | gpt-oss-120b | gemini-3.7-flash |
|---|---|---|
| Time | 148s | **26s** |
| Output tokens | 10,591 | **7,817** |
| Questions | 23/23 | 23/23 |
| Marks | 40/40 | 40/40 |
| Answer key | 100% | 100% |
| Our score | 96 | 95 |
| Variety | 87% | 83% |
| **Off-syllabus** | **22%** | **0%** |
| Cost per paper | **₹0.58** | ₹2.69 |

## The one that matters

gpt-oss-120b put Class 11 and 12 material in a Class 10 paper: `sin 15°`, `cos 75°`,
`tan 75°`, the cosine rule, `tan⁻¹`, quadrants — 22% of the paper.

**Gemini produced zero off-syllabus questions.** Every one of its 23 is genuine NCERT
Class 10 Chapter 8 content:

- `If sin θ = ½, find cos(90° − θ)` — complementary angles
- `If sec θ + tan θ = p, find sec θ − tan θ` — a standard Class 10 identity problem
- `Prove cos A/(1+sin A) + (1+sin A)/cos A = 2 sec A` — straight from the NCERT exercises
- `If tan(A+B) = √3 and tan(A−B) = 1/√3, find A and B` — NCERT Exercise 8.4
- Case study: *"Aarav, a civil engineering student in Jaipur, is designing a triangular
  solar panel frame ABC…"* — Indian context, correct level

## What this changes

The syllabus database was the next big build, on the assumption that no model knows the CBSE
syllabus. **Gemini does.** If that holds across other subjects and classes, the database
becomes an optimisation rather than a prerequisite — which is months of work.

That needs confirming on Science, Social and a couple of other classes before we rely on it.

## Operational note

Gemini rejected `max_tokens: 16000` three times with *"This model is currently experiencing
high demand"*, then succeeded immediately at 8,000. The error is about the size of the
requested generation on the free tier, not genuine load. Our configured ceiling for Google is
already 8,000, so production is unaffected — but never raise it.

## The open question: cost

₹2.69 vs ₹0.58 per paper. At 300 papers per teacher per year that is ₹807 against ₹300 of
revenue — Gemini loses money at the current price. Three ways out, in order of appeal:

1. **`gemini-3.5-flash-lite`** — $0.15/$1.25 per 1M on OpenRouter, about **₹0.92 a paper**.
   If it is also 0% off-syllabus, it wins outright. Untested.
2. Gemini for question papers, a cheap model for worksheets/lesson plans/slides.
3. Raise the price.

## gemini-3.5-flash-lite — cheaper, but not good enough (2026-08-31)

Tested as the possible best-of-both: Gemini's syllabus knowledge at near-gpt-oss pricing.

| | gemini-3.7-flash | gemini-3.5-flash-lite |
|---|---|---|
| Score | **95** | 80 |
| Variety | **83%** | 64% |
| Off-syllabus | **0%** | 5% |
| Marks | **40/40** | 36/40 (truncated) |
| Output tokens | 7,817 | 7,996 |
| Time | 26s | 23s |
| Cost/paper (paid) | ₹2.69 | ~₹0.92 |

It used MORE tokens for FEWER questions, and 36% of its question stems repeat — which is not a
truncation artefact, since variety was measured on the 22 questions it did produce. It also
lost the perfect syllabus record.

**Verdict: not worth the saving.** gemini-3.7-flash stays the quality choice.
