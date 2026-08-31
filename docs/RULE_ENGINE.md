# The Rule Engine — what actually gets sent to the AI

There is no separate rules file. The engine is four functions inside `teachers.html`:

| Function | Line | What it decides |
|---|---|---|
| `getBlueprint()` | 3905 | Sections, how many questions, marks per question |
| `paperDesignRules()` | 3855 | Difficulty mix, Bloom mix, no-repetition, Indian context, command words |
| `boardMarkingRules()` | 3840 | How that board marks answers |
| `blueprintToText()` | 3967 | Turns the blueprint into prompt text |
| `buildPaperPrompt()` | 3988 | Assembles the final instruction sheet below |

Below is the REAL text generated for: **CBSE · Class 9 · Mathematics (Standard) ·
Trigonometry · Term Exam · 50 marks**. This is verbatim what the model receives.

---

## SYSTEM MESSAGE

You are an elite examination-board paper setter and B.Ed-qualified subject expert.
You output ONE single valid JSON object and NOTHING else — no prose, no markdown fences.
All mathematics, formulae, units and symbols MUST be written as LaTeX inside single-dollar
delimiters, e.g. `$3x+5=20$`, `$H_2O$`, `$\frac{1}{2}mv^2$`, `$\le$`, `$\times$`, `$90^\circ$`.
Never use raw < or > for inequalities.
Do NOT use emojis. Write academically and age-appropriately for the stated class.
Every context must be INDIAN: the rupee symbol ₹ for all money (never $ or any foreign
currency), Indian names, Indian cities and the metric system.

## USER MESSAGE — the requirements

- **Chapter/topic:** "Trigonometry" — spread questions across ALL listed chapters.
- **Blueprint (must not add or drop sections):**
  - Section A: **20** questions × 1 mark
  - Section B: **11** questions × 2 marks
  - Section C: **4** questions × 5 marks
  - Section D: **3** questions × 4 marks — case study, sub-parts 1+1+2
- **"The SUM of all question marks MUST equal exactly 50."**
- **MCQ rules:** the stem must be a QUESTION, four plausible subject-specific options,
  distractors reflecting realistic student errors. Forbidden: "Correct/Incorrect",
  "True/False", "Both A and B", "All/None of the above". Never reuse the same 4 options.
- **Difficulty mix by marks:** Easy 20% (~10) · Average 60% (~30) · Difficult 20% (~10).
  Order questions easiest-first within a section.
- **Cognitive mix:** ~half the paper competency-based. Remembering+Understanding 40%,
  Applying 30%, Analysing+Evaluating+Creating 30%.
- **NO REPETITION:** never test the same concept, formula or fact twice, and never repeat a
  question stem — including inside OR-choices.
- **Indian context only:** Indian names (Aarav, Meera, Ravi…), Indian cities, ₹, metric.
- **Command words** matched to level: State/Define/List → recall; Explain/Describe →
  understanding; Calculate/Solve/Apply → application; Analyse/Compare/Justify → higher order.
- **Answer key:** EVERY question needs `answer`, `solution`, `bloom` and `difficulty`.
  Case-study sub-parts each need their own answer and solution. CBSE step-wise positive
  marking: award marks for every correct step even if the final answer is wrong.

---

## ⚠️ CONTRADICTION FOUND (2026-08-30)

The blueprint above asks for **20 + 11 + 4 + 3 questions**, which is
`20×1 + 11×2 + 4×5 + 3×4` = **74 marks**.
The very next line says the total **must equal exactly 50**.

Both cannot be true. The extra questions are deliberate — we ask for ~2 spares per section and
trim to the exact count in code, which is what makes the marks land exactly without a second
AI call. But the prompt never explains that, so the model is handed two impossible
instructions and has to guess which to obey.

**Fix:** state the spares explicitly and drop the exact-sum demand, since marks are enforced
in code afterwards regardless.
