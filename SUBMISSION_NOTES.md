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

Suggested structure:

1. **(30s) The problem.** Security teams write detection rules once per
   tool (Splunk, Sigma, Elastic...) and they drift out of sync. Say it in
   your own words.
2. **(90s) Open the playground** (`index.html`). Pick "Credential Stuffing"
   from the dropdown. Walk through the rule out loud: what `when`, `within`,
   `severity`, `tags` mean. Point out the live "Parsed rule ✓" status bar.
3. **(60s) Switch the three output tabs** — Splunk SPL, Sigma YAML, Elastic
   EQL — and point out they're generated from the *same* rule. Mention the
   `# NOTE:` comments where a translation is lossy (e.g. Sigma can't compare
   two fields) — this shows judges you understand the domain, not just that
   you wrote a template.
4. **(60s) Live-edit the rule** — change `>= 5` to `>= 2`, watch the "live
   test run" panel re-evaluate against the sample log events in real time,
   and show a previously-"no match" row flip to "MATCH". This is the
   strongest "wow" moment because it's genuinely interactive, not a
   pre-rendered screenshot.
5. **(30s) Show the CLI** (`node cli.js compile examples/impossible-travel.shieldql`)
   so judges see this isn't only a browser toy — there's a real compiler
   underneath usable from a terminal/CI pipeline.
6. **(30s) Close** on real-world impact: this is the same "one config, many
   targets" idea as Terraform or Sigma itself, and adding a new target
   (YARA, Suricata, a new SIEM) is one more function against the existing
   AST — no language changes.

## Mapping what's built to the judging rubric

| Criterion (weight) | Where it shows up |
|---|---|
| Innovation & Originality (25) | Multi-target transpiler for a real, underserved pain point (SOC teams juggling SPL/Sigma/EQL) — not "yet another toy language" |
| Technical Implementation (25) | Real hand-written lexer + recursive-descent parser + AST-walking interpreter + 3 independent code generators, all in `engine.js`, tested via `test-smoke.js` |
| Language Design (20) | Small, readable grammar (`LANGUAGE.md`) purpose-built for one domain — a security rule reads like a sentence |
| Documentation & Presentation (10) | `README.md`, `LANGUAGE.md`, zero-install setup (open one HTML file), explicit "known limitations" section |
| Real-World Impact (15) | Solves a real, named problem; explicit extensibility story (new backend = new function) |
| User Experience (5) | Live-updating playground with syntax highlighting, tabbed output, and a live test runner against sample data — no install, no build step |

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
