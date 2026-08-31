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
