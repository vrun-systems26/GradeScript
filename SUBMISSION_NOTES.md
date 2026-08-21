# Submission notes (for you, not for the repo)

This is prep material for *you* to actually present — write it in your own
words for the video and the Devpost form. Judges may ask follow-up
questions, so make sure you can explain each part below, not just read it.

## One-line pitch

"GradeScript lets you write a grading policy once and get a live
calculator with a reverse solver, a syllabus paragraph, a spreadsheet
formula, and an LMS config — all generated from that one source, plus a
GPA dashboard across your whole course load, which almost no online
calculator does."

## What to show in the 5-minute demo video

**See [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md) for the full narration, timed to
5 minutes**, including a landing-page walkthrough, every term defined
inline, a click-by-click cheat-sheet, and a Q&A section for likely
judge questions.

## Mapping what's built to the judging rubric

| Criterion (weight) | Where it shows up |
|---|---|
| Innovation & Originality (25) | The reverse solver ("what do I need on the Final?") and the multi-class GPA Dashboard — both genuinely rare in grade-calculator tools, which are almost universally single-class and forward-only |
| Technical Implementation (25) | Real hand-written lexer + recursive-descent parser + a real weighted-average/reverse-solve calculator + 3 independent code generators, all in `engine.js`, tested via `test-smoke.js` |
| Language Design (20) | A deliberately minimal grammar (4 statement kinds, no boolean expressions) purpose-built for one domain — plus a table editor that generates real source, so non-coders never have to touch syntax |
| Documentation & Presentation (10) | `README.md`, `LANGUAGE.md`, zero-install setup, explicit "known limitations" section (including that the dashboard is a snapshot, not live-linked) |
| Real-World Impact (15) | Solves a real, universal problem (re-entering a grading policy every time) with a genuinely useful extra (the reverse solver) that teachers and students would actually want |
| User Experience (5) | Table editor instead of raw code, animated grade number, reassuring/non-alarming copy and color choices, in-page help panel — no install, no build step |

## Mapping what's built to the 6 prize tracks

- **Best Compiler** — three genuinely different output formats (natural-
  language paragraph, spreadsheet formula, structured JSON config) from
  one AST — strongest fit.
- **Best Interpreter** — `computeGrade` and `solveForTarget` are real
  arithmetic over the AST, not string matching; the solver in particular
  demonstrates non-trivial logic (solving an equation, not just walking a
  tree).
- **Best Technical Implementation** — full pipeline, tested, documented,
  honest about scope (see Known Limitations).
- **Best User Experience** — the table editor is the strongest card here:
  a real non-technical user never has to see syntax unless they choose to.
- **Most Innovative DSL** — moderate, honest case: grading-policy DSLs
  aren't unheard of, but pairing one with a reverse solver and a
  cross-class dashboard is a genuine, demonstrable combination.
- **Future of Programming Award** — "describe a policy once, derive every
  representation of it" is the same shift infrastructure-as-code went
  through — a legitimate forward-looking framing.

## Known limitations — be ready to say these out loud, unprompted if needed

1. **The reverse solver assumes the worst case for other ungraded
   categories.** It's a conservative, guaranteed-safe answer, not an
   optimistic "if everything else also improves" projection.
2. **The GPA Dashboard is a snapshot of the 6 default classes, not
   live-linked to whatever you're editing on the Build tab.** This is
   stated in the dashboard's own on-screen caption — not a hidden gap.
3. **The LMS Config output's field names are illustrative**, approximating
   real concepts (like Canvas's weighted assignment groups) rather than
   matching one specific school's exact API schema.

## Things to actually decide/do before submitting

- [ ] Register for the hackathon and confirm your team on the
      [participants page](https://syntax-summit.devpost.com/participants).
- [ ] Push this project to a public GitHub repo. Consider renaming the
      repo itself from `ShieldQL` to `GradeScript` on github.com to match
      — the local project already uses the new name throughout.
- [ ] Record the demo video yourself, narrating in your own words.
- [ ] Check the Devpost submission form for any "what tools did you use"
      / AI-disclosure field, and answer it honestly if present.
- [ ] Optionally: add a 7th example class of your own via the table editor
      to make the project feel more "yours."
- [ ] Deadline: submissions close **September 5 at 5:00 AM PDT**. Judging
      runs Sep 5–10; winners announced Sep 10.
