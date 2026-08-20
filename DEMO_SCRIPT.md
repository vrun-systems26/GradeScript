# Demo video script (structure only — narrate in your own words)

Target: 5:00. This is scaffolding to adapt, not something to read verbatim —
judges can tell, and you should be able to answer follow-up questions on
anything you say here. Timestamps are approximate; leave yourself a little
slack since talking-while-clicking always runs long.

Before recording: have the playground open at `index.html` (or via
`node serve.js`) with the "Credential Stuffing" example loaded, and a
terminal ready with `node cli.js compile examples/impossible-travel.shieldql`
typed but not yet run.

---

## 0:00–0:25 — The problem (talking head or voiceover, no screen yet)

> "Security teams don't run just one tool. A typical SOC uses Splunk,
> maybe Sigma for sharing detection rules, maybe Elastic too. The problem
> is nobody wants to write the same detection logic three times — once per
> tool — because every rewrite is a chance to get it subtly wrong, and the
> three copies drift out of sync over time.
>
> So we built ShieldQL: a small language where you write a security
> detection rule once, and it compiles into all three."

## 0:25–1:00 — Introduce the playground

*[Screen: index.html, header visible]*

> "This is the ShieldQL playground — one HTML file, zero installs, zero
> build step. On the left is the rule editor. On the right is the compiled
> output. Let's load an example."

*[Action: click the "Load example" dropdown, select "Credential Stuffing"]*

> "This rule flags a login after 5+ failed attempts, from a country that
> doesn't match the user's home country, within a 10-minute window."

## 1:00–2:00 — Walk through the syntax

*[Screen: point at each part of the rule in the editor as you say it]*

> "Every rule has a name, a `when` clause — that's the actual logic, built
> from `and`, `or`, `not`, and comparisons like `>=` and `!=` — and some
> metadata: `within` for a time window, `severity`, `tags`, and a plain
> `description`.
>
> Fields are dotted paths — `event.failed_attempts`, `user.home_country` —
> so the rule reads almost like a sentence: 'when the event type is login,
> and failed attempts are 5 or more, and the country doesn't match the
> user's home country.'"

*[Action: point at the green status bar]*

> "Down here, the status bar tells you the moment your rule successfully
> parses — 'Parsed rule CredentialStuffing, severity high, within 10
> minutes' — so you get instant feedback if you make a typo."

## 2:00–2:45 — The three compiled outputs

*[Action: click each output tab in turn: Splunk SPL, Sigma YAML, Elastic EQL]*

> "This one rule compiles to three real query languages. Splunk SPL on the
> left... Sigma YAML, the vendor-neutral format security teams share rules
> in... and Elastic EQL.
>
> This isn't just string templating — each of these is generated from the
> same parsed structure, called an AST, so the meaning can't drift between
> tools. And where a translation is genuinely lossy — for example, Sigma
> has no native way to compare two fields to each other — the generator
> tells you that explicitly with a note, instead of silently producing a
> rule that looks right but isn't."

*[Action: point at a `# NOTE:` comment in the Sigma or Splunk output]*

## 2:45–3:45 — Live edit (the key "wow" moment)

*[Screen: scroll down to the "Live test run" panel — point out the 7 sample
events and the "1 / 7 matched" counter]*

> "Down here, the interpreter is running this exact rule against seven
> sample security events in real time — logins, file transfers, process
> starts. Right now it's catching the credential-stuffing pattern and
> correctly ignoring the six benign ones.
>
> Let's edit the rule live."

*[Action: click into the editor, change `>= 5` to `>= 2`]*

> "I just lowered the failed-attempt threshold from 5 to 2. Watch the test
> panel — [point] — it just re-evaluated against all seven events instantly,
> with no save, no compile step, no page reload. That's the interpreter and
> both other output tabs updating live off the same parse."

## 3:45–4:15 — It's a real compiler, not just a browser toy

*[Screen: switch to terminal]*

> "This isn't only a web demo — there's a command-line compiler too, so it
> could run in CI or a build pipeline."

*[Action: run `node cli.js compile examples/impossible-travel.shieldql --target=sigma`]*

> "Same engine, same output, from the terminal. And the whole thing is
> covered by an end-to-end test that parses, compiles, and interprets every
> example rule and checks the results — [optionally: run `node test-smoke.js`
> and show 'ALL OK']."

## 4:15–4:45 — Why this matters

> "The real-world model here is the same one Terraform uses for cloud
> infrastructure, or Sigma itself uses for sharing rules: one source of
> truth, many compiled targets. Adding support for a new tool — YARA,
> Suricata, another SIEM — is just one more function against the existing
> parsed rule. No changes to the language, no changes to rules teams
> already wrote."

## 4:45–5:00 — Close

> "ShieldQL: write your detection logic once, in a language built for the
> job, and let it speak Splunk, Sigma, and Elastic fluently. Thanks for
> watching."

*[Screen: hold on the playground or a title card with the repo link]*

---

## Quick checklist while recording

- [ ] Show the dropdown / example switching (proves it's not one hardcoded demo)
- [ ] Show at least one `# NOTE:` comment in the compiled output (proves technical honesty)
- [ ] Do the live-edit moment (proves it's genuinely interactive, not screenshots)
- [ ] Show the CLI (proves it's a real compiler, not just a web page)
- [ ] Say the problem statement and the real-world-impact line in your own words — these map directly to two judging criteria worth 40 of the 100 points combined
