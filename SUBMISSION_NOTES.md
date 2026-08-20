# Submission notes (for you, not for the repo)

This is prep material for *you* to actually present — write it in your own
words for the video and the Devpost form. Judges may ask follow-up
questions (in comments or live), so make sure you can explain each part
below, not just read it.

## One-line pitch

"ShieldQL lets you write one security detection rule and get it compiled
into Splunk, Sigma, and Elastic's query languages automatically, so a SOC
team stops maintaining the same logic three times."

## What to show in the 5-minute demo video

Devpost asks for: project repo + a demo video (≤5 min) showing the language
in action, its key features, and how users interact with it.

**See [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md) for the full narration, timed to
5 minutes, including a landing-page walkthrough, every term defined inline,
a click-by-click cheat-sheet, and a Q&A section for questions judges are
likely to ask** (including the honest answer on what `within` does and
doesn't do yet — see "Known limitations" below).

## Mapping what's built to the judging rubric

| Criterion (weight) | Where it shows up |
|---|---|
| Innovation & Originality (25) | Multi-target transpiler for a real, underserved pain point (SOC teams juggling SPL/Sigma/EQL) — not "yet another toy language" |
| Technical Implementation (25) | Real hand-written lexer + recursive-descent parser + AST-walking interpreter + 3 independent code generators, all in `engine.js`, tested via `test-smoke.js` |
| Language Design (20) | Small, readable grammar (`LANGUAGE.md`) purpose-built for one domain — a security rule reads like a sentence |
| Documentation & Presentation (10) | `README.md`, `LANGUAGE.md`, zero-install setup (open one HTML file), explicit "known limitations" section |
| Real-World Impact (15) | Solves a real, named problem; explicit extensibility story (new backend = new function) |
| User Experience (5) | Live-updating playground with syntax highlighting, tabbed output, and a live test runner against sample data — no install, no build step |

## Known limitations — be ready to say these out loud, unprompted if needed

Judges respect honesty about scope more than they penalize it. Two things
worth knowing cold:

1. **Sigma can't express field-to-field comparisons, `or`, or `not`
   natively.** The generator flags this with a `# NOTE:` comment instead of
   producing a subtly wrong rule. This is a real constraint of the Sigma
   format, not a bug in ShieldQL.
2. **`within` is metadata passed to each target, not a live temporal
   engine.** The playground's test panel evaluates a rule against one
   event at a time — it doesn't simulate a rolling multi-event time window.
   The generated Splunk/Sigma/Elastic code correctly expresses the time
   window in each tool's own syntax; the local interpreter just doesn't
   simulate that window itself yet. See `README.md`'s "Known limitations"
   section for the full wording, and `DEMO_SCRIPT.md`'s Q&A section for how
   to answer this if asked directly.

## Things to actually decide/do before submitting

- [ ] Register for the hackathon and confirm your team (solo is fine, or up
      to 4 people) on the [participants page](https://syntax-summit.devpost.com/participants).
- [ ] Push this project to a public GitHub repo (the submission requires a
      project repository link).
- [ ] Record the demo video yourself, narrating in your own words — you
      should be the one talking, since judges may follow up with questions.
- [ ] Check the actual Devpost submission form when you get there for any
      "what tools did you use" / AI-disclosure field, and answer it
      honestly if present.
- [ ] Optionally: add 1-2 more example rules of your own to make the
      project feel more "yours" — the grammar is documented in
      `LANGUAGE.md` and adding a rule is just adding a new `.shieldql` file.
- [ ] Deadline: submissions close **September 5 at 5:00 AM PDT**. Judging
      runs Sep 5–10; winners announced Sep 10.
