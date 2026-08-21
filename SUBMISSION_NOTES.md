# Submission notes (for you, not for the repo)

This is prep material for *you* to actually present — write it in your own
words for the video and the Devpost form. Judges may ask follow-up
questions, so make sure you can explain each part below, not just read it.

**⚠️ Deadline conflict — verify this yourself before anything else.**
Build Beyond's own Devpost pages disagree with each other: the Schedule
tab shows submissions closing **August 21 at 11:45 PM PDT**, while the
Rules tab text says **August 15 at 9:00 PM PDT** (already past as of
writing). Devpost's schedule widget is usually the one that actually
gates the submission form, so August 21 is more likely correct — but log
into your Devpost account and confirm the submission form is still open
before treating this as settled.

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

## Mapping what's built to Build Beyond's actual judging rubric

Build Beyond's criteria are structured very differently from a
DSL-specific hackathon — no "language design" category, and Technical
Execution alone is worth nearly a third of the score.

| Criterion (weight) | Where it shows up |
|---|---|
| Technical Execution (30%) | Real hand-written lexer + recursive-descent parser + a real weighted-average/reverse-solve calculator + 3 independent code generators, all tested via `test-smoke.js`; plus real UI engineering (the table editor never loses focus, class identity survives renames, localStorage persistence) |
| Originality & Creativity (25%) | The reverse solver ("what do I need on the Final?") and the multi-class GPA Dashboard — both genuinely rare in grade-calculator tools, which are almost universally single-class and forward-only |
| Impact & Usefulness (20%) | Solves a real, universal problem (re-entering a grading policy every time) with a genuinely useful extra (the reverse solver) that teachers and students would actually want |
| UX & Design (15%) | Table editor instead of raw code, animated grade number, reassuring/non-alarming copy and color choices, in-page help panel, zero-scroll layout — no install, no build step |
| Clarity of Submission (10%) | `README.md`, `LANGUAGE.md`, zero-install setup, explicit "known limitations" section, and the demo video itself |

## Mapping what's built to Build Beyond's 4 actual prizes

These are different prizes than the ones GradeScript was originally
scoped against (there's no "Best Compiler" or "Best Interpreter" track
here) — here's the honest case for each:

- **Best Overall Project** — the strongest fit. Judged across the board
  (creativity + execution + polish), which is exactly where this project
  is strongest: a real compiler underneath, a genuinely novel reverse
  solver, and a polished, tested UI.
- **Most Creative Project** — solid case: the reverse solver and the
  cross-class GPA Dashboard are the two things almost no other grade
  calculator does. Lean on these specifically, not the DSL angle — Build
  Beyond has no theme requiring a custom language, so "I built a
  language" alone won't read as creative here the way it would have for a
  DSL-specific hackathon. "I built a calculator that solves backward" is
  the more compelling creative hook for this audience.
- **Best Real-World Application** — strong, straightforward case: every
  student needs this, the problem is universal and immediately relatable
  to any judge.
- **Best First-Timer Project** — only relevant if you're actually new to
  coding/hackathons; check the Devpost submission form for how this gets
  self-nominated (usually a checkbox), don't claim it if it doesn't apply.

## Known limitations — be ready to say these out loud, unprompted if needed

1. **The reverse solver assumes the worst case for other ungraded
   categories.** It's a conservative, guaranteed-safe answer, not an
   optimistic "if everything else also improves" projection.
2. **The GPA Dashboard's average per category comes from what you typed
   in, not a hidden formula.** Whichever class you're actively editing on
   the Build tab is marked "editing live" on the dashboard and reflects
   your numbers instantly, including newly-added or renamed classes.
3. **The LMS Config output's field names are illustrative**, approximating
   real concepts (like Canvas's weighted assignment groups) rather than
   matching one specific school's exact API schema.

## Things to actually decide/do before submitting

- [ ] **Verify the real deadline first** (see the warning at the top of
      this file) — everything else is moot if you've run out of time.
- [ ] Confirm your team on Build Beyond's
      [participants page](https://build-beyond-hackathon.devpost.com/participants)
      (teams of 1–5, solo is fine).
- [ ] Push this project to a public GitHub repo (already done — see
      `github.com/vrun-systems26/GradeScript`).
- [ ] Record the demo video yourself, narrating in your own words. Note:
      `DEMO_SCRIPT.md`'s cold-open line already says "Build Beyond," not
      Syntax Summit.
- [ ] Check the Devpost submission form for any "what tools did you use"
      / AI-disclosure field, and answer it honestly if present — Build
      Beyond's submission checklist explicitly asks for your "Technology
      Stack," which is a natural, honest place to mention it.
- [ ] Build Beyond's submission form asks for: project name, the idea/how
      it works/main features/tech stack/intended audience, at least one
      demo visual (screenshot or video — required), and optionally a
      source code or live-demo link (recommended, not required, but you
      have both — use them).
