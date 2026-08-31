# Token research — Maths papers, all sizes

**Setup:** CBSE · Class 10 · Mathematics · Trigonometry · `gpt-oss-120b` on **OpenRouter**,
`reasoning_effort: medium`, JSON mode, `max_tokens: 16000` (no cap of our own).
Measured 2026-08-31 against the live proxy.

| Marks | Questions | Tokens in | Tokens out | Total | Time | Cost | Score | Variety | Complete? |
|---|---|---|---|---|---|---|---|---|---|
| 10 | 8/8 | 1,574 | 5,065 | 6,639 | 62s | ₹0.29 | 94 | 88% | ✅ |
| 20 | 13/13 | 1,592 | 6,779 | 8,371 | 99s | ₹0.38 | **100** | **100%** | ✅ |
| 25 | 16/16 | 1,580 | 8,913 | 10,493 | 214s | ₹0.49 | 94 | 81% | ✅ |
| 40 | 23/23 | 1,625 | 10,591 | 12,216 | 148s | ₹0.58 | 96 | 87% | ✅ |
| 50 | 30/30 | 1,624 | 12,928 | 14,552 | 149s | ₹0.70 | 95 | 83% | ✅ |
| 80 | 39/39 | 1,689 | 12,786 | 14,475 | **290s** | ₹0.70 | 92 | 92% | ✅ |

Every size finished with `finish_reason: stop` — nothing truncated. Every paper hit its mark
total exactly and had a 100% complete answer key.

## Findings

**1. Removing our own token cap was the whole fix.** Previously we asked for 4,800 and every
model failed. Asking for what the job needs, and nothing less, produced six clean papers.

**2. Real ceiling is ~13,000 output tokens, not 17,000.** The largest paper (80 marks, 39
questions) used 12,786. So the proxy's 16,000 cap is enough for every paper size we sell — no
need to raise it, and no need for section-by-section generation to fit within limits.

**3. Prompt size is flat (~1,600 tokens) regardless of paper size.** Only output scales.

**4. Cost is not a constraint.** ₹0.29–0.70 per paper. Against ₹300/year that is 430–1,000
papers per teacher before break-even, and a heavy teacher writes maybe 300 a year.

**5. The real constraint is TIME.** An 80-mark paper took **4 minutes 50 seconds**. Teachers
will not sit and wait that long — this, not tokens or money, is now the limiting factor.
Section-by-section generation is still worth doing, but for SPEED (parallel calls), not to fit
a token budget.

**6. Bigger papers score slightly lower on variety** (100% at 20 marks → 83–92% at 50–80).
More questions on one chapter means more chance of repeats.

## Cost per teacher per year, at these rates

| Papers/year | AI cost |
|---|---|
| 100 | ₹40 |
| 300 | ₹120 |
| 1,000 | ₹450 |
