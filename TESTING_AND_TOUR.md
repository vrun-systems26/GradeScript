# Testing it yourself + interface tour (for filming)

## Part 1 — Test it yourself, step by step

You need Node.js installed (you likely already have it, since `npm`/`node`
commands show up elsewhere on this machine). No other install is required.

1. Open a terminal and go to the project folder:
   ```bash
   cd path/to/ShieldQL
   ```
2. Run the automated test suite. This parses all 4 example rules, compiles
   each to Splunk/Sigma/Elastic, and runs the interpreter against 7 sample
   events — it should print `ALL OK` at the end:
   ```bash
   node test-smoke.js
   ```
3. Try the command-line compiler yourself:
   ```bash
   node cli.js compile examples/credential-stuffing.shieldql
   node cli.js compile examples/data-exfiltration.shieldql --target=sigma
   node cli.js test examples/impossible-travel.shieldql sample-logs/logs.json
   ```
4. Open the web playground. Either double-click `index.html`, or serve it
   properly (recommended, avoids browser file-access quirks):
   ```bash
   node serve.js
   ```
   then open `http://localhost:5173` in a browser.
5. In the playground: pick each example from the dropdown, watch the
   status bar confirm it parsed, click through the 3 output tabs, then
   scroll to the bottom panel and confirm the match/no-match results make
   sense for that rule.
6. Break something on purpose to see error handling: delete a `{` or
   misspell `and` — the status bar should turn red with a specific error
   message, and the output/test panels should clear rather than show stale
   or wrong results.
7. Try writing your own rule from scratch using `LANGUAGE.md` as a
   reference, to convince yourself you actually understand the syntax (and
   so you can answer questions about it).

## Part 2 — Interface tour (so you know exactly where to click while filming)

Layout, top to bottom, left to right:

**Header (very top)**
- Far left: the **ShieldQL** logo and a small "DSL compiler" badge.
- Center: a one-line tagline describing the whole project.
- Right side: the **"Load example"** dropdown — this swaps which of the 4
  built-in rules is loaded into the editor.
- Far right: a **"❓ How to use this"** button — opens a slide-in panel
  from the right with a step-by-step guide and a mini glossary. Good to
  point out in the video ("and if a judge opens this without me, there's a
  help button right here").

**Tip banner (thin colored bar just under the header)**
- A one-line hint for first-time visitors. Has a ✕ to dismiss it — once
  dismissed it stays dismissed (remembered in the browser).

**Panel 1 — top left, labeled "1. Write the rule"**
- The rule editor itself. Syntax-highlighted (pink = keywords, green =
  strings, yellow = numbers).
- Directly under it: a **status bar** — green text with a ✓ when the rule
  parses correctly (showing the rule's name, severity, time window, tags),
  or red text with a ✗ and the specific error if something's broken.

**Panel 2 — top right, labeled "2. See it translated"**
- Three pill-shaped tab buttons: **Splunk SPL**, **Sigma YAML**, **Elastic
  EQL**. Click any tab to see that translation of the current rule.
- Below the tabs: the actual generated code/config for whichever tab is
  selected.
- At the very bottom of this panel: a small dimmed tip line reminding the
  viewer all three come from the same source rule.

**Panel 3 — full width along the bottom, labeled "3. Prove it actually
works"**
- A count at the top: "`N / 7 sample events matched this rule`."
- Below that: 7 rows, one per sample security event, each with a colored
  badge (**MATCH** in green, **no match** in gray, **ERROR** in red if
  something went wrong) and a plain-English label describing that sample
  event (e.g. "Credential stuffing pattern", "Normal login").
- At the bottom: a tip suggesting the viewer edit a number in the rule
  above and watch this list update live — this is the single best thing
  to demonstrate on camera, since it proves the tool is really running,
  not just displaying pre-made screenshots.

**Footer (very bottom)**
- One line noting it's zero-install, with links to `LANGUAGE.md` (full
  syntax reference) and `GLOSSARY.md` (every term explained).

### Suggested filming path

1. Start on the default-loaded "Credential Stuffing" example — don't touch
   the dropdown yet, let viewers see the initial state.
2. Narrate panel 1 (the rule, in plain words).
3. Click through the 3 tabs in panel 2.
4. Scroll down, narrate panel 3, point at the match count.
5. Edit a number in panel 1 live, and hold the camera on panel 3 so the
   viewer visibly sees a row flip from "no match" to "MATCH" (or vice
   versa) with zero delay.
6. Optionally switch the dropdown to a second example (e.g. "Privilege
   Escalation") to prove it isn't a one-off demo.
7. Cut to the terminal for the CLI portion (see `DEMO_SCRIPT.md`).
