# Submission notes (for you, not for the repo)

This is prep material for *you* to actually present — write it in your own
words for the video and the Devpost form. Judges may ask follow-up
questions (in comments or live), so make sure you can explain each part
below, not just read it.

## One-line pitch

"PulseQL lets you write one home-automation rule and get it compiled into
Home Assistant, Node-RED, and IFTTT automatically, so you stop maintaining
the same automation logic three separate times across the platforms you
actually use."

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
| Innovation & Originality (25) | A cross-platform automation *authoring* language with its own live tester — not a converter that starts from an already-written config, but a place to write and prove a rule before it exists anywhere else |
| Technical Implementation (25) | Real hand-written lexer + recursive-descent parser + AST-walking interpreter + 3 independent code generators, all in `engine.js`, tested via `test-smoke.js` |
| Language Design (20) | Small, readable grammar (`LANGUAGE.md`) purpose-built for one domain — an automation rule reads like a sentence |
| Documentation & Presentation (10) | `README.md`, `LANGUAGE.md`, zero-install setup (open one HTML file), explicit "known limitations" section |
| Real-World Impact (15) | Solves a real, named problem (very few smart homes run just one platform); explicit extensibility story (new backend = new function) |
| User Experience (5) | Live-updating playground, in-page help panel with a mini glossary, per-example plain-English descriptions, inline comments in every rule — no install, no build step |

## Mapping what's built to the 6 prize tracks

Devpost separately gives 6 non-cash prizes. Here's the honest case for each,
so you know which ones to lean into if a judge is deciding between tracks:

- **Best Compiler** — the strongest fit. Three genuinely different code
  generators walk the *same* AST: Home Assistant gets a declarative YAML
  template trigger, Node-RED gets a real JavaScript function node, IFTTT
  gets real JavaScript Filter Code. That's meaningfully more varied than
  three flavors of the same query-language shape — it's a declarative
  config, a node-graph JSON structure, and an imperative script, from one
  source.
- **Best Interpreter** — also strong. `runRule` genuinely walks the AST and
  evaluates it against JSON data, powering the live "MATCH / no match"
  panel — not a hardcoded demo, a real interpreter you can watch update as
  you type.
- **Best Technical Implementation** — the full pipeline (lexer → parser →
  AST → interpreter + 3 codegens), covered by an end-to-end test, with a
  documented "known limitations" section instead of silent gaps.
- **Best User Experience** — the playground: a minimal landing sequence,
  live syntax highlighting, inline per-line comments explaining every
  value, a persistent help panel, and instant feedback with zero save/
  reload steps.
- **Most Innovative DSL** — the honest, moderate case: rule-translation
  tools exist, but PulseQL's angle — write once, test locally before
  export, target 3 platforms with real structural differences — is a
  genuine combination, not a wildly novel category invention. Don't
  oversell this one; lean on Best Compiler/Interpreter instead if pressed.
- **Future of Programming Award** — the "why this matters" framing: one
  source of truth, many compiled targets, is the same shift infrastructure
  code went through with Terraform. Positioning PulseQL as "the same idea,
  applied to home automation" is a legitimate forward-looking narrative.

## Known limitations — be ready to say these out loud, unprompted if needed

Judges respect honesty about scope more than they penalize it. Two things
worth knowing cold:

1. **IFTTT (and to a lesser extent the others) can't express arbitrary
   time-window logic natively.** IFTTT keeps no memory between runs, so a
   rule needing that is flagged with a comment instead of producing
   something that looks right but isn't. This is a real constraint of the
   platform, not a bug in PulseQL.
2. **`within` is metadata passed to each target, not a live temporal
   engine.** The playground's test panel evaluates a rule against one
   sensor reading at a time — it doesn't simulate a rolling multi-reading
   time window. The generated Home Assistant/Node-RED/IFTTT output
   correctly expresses the time window where each platform supports one;
   the local interpreter just doesn't simulate that window itself yet. See
   `README.md`'s "Known limitations" section for the full wording, and
   `DEMO_SCRIPT.md`'s Q&A section for how to answer this if asked directly.

## Things to actually decide/do before submitting

- [ ] Register for the hackathon and confirm your team (solo is fine, or up
      to 4 people) on the [participants page](https://syntax-summit.devpost.com/participants).
- [ ] Push this project to a public GitHub repo (the submission requires a
      project repository link). Consider whether to rename the GitHub repo
      itself from `ShieldQL` to `PulseQL` to match — that's a setting you'd
      change yourself on github.com, the local project already uses the
      new name throughout.
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
