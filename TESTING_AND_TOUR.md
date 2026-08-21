# Testing it yourself + interface tour (for filming)

## Part 1 — Test it yourself, step by step

You need Node.js installed (you likely already have it, since `npm`/`node`
commands show up elsewhere on this machine). No other install is required.

1. Open a terminal and go to the project folder:
   ```bash
   cd path/to/ShieldQL
   ```
2. Run the automated test suite. This parses all 4 example rules, compiles
   each to Home Assistant/Node-RED/IFTTT, and runs the interpreter against
   7 sample sensor readings — it should print `ALL OK` at the end:
   ```bash
   node test-smoke.js
   ```
3. Try the command-line compiler yourself:
   ```bash
   node cli.js compile examples/motion-lighting.shieldql
   node cli.js compile examples/energy-saver.shieldql --target=nodered
   node cli.js test examples/leak-prevention.shieldql sample-logs/logs.json
   ```
4. Open the web playground. Either double-click `index.html`, or serve it
   properly (recommended, avoids browser file-access quirks):
   ```bash
   node serve.js
   ```
   then open `http://localhost:5173` in a browser.
5. In the playground: click through the landing slides, pick each example
   from the dropdown, watch the status bar confirm it parsed, edit a number
   and watch the live results update, then switch to the "See it
   Translated" tab and click through the 3 output tabs.
6. Break something on purpose to see error handling: delete a `{` or
   misspell `and` — the status bar should turn red with a specific error
   message, and the output/test panels should clear rather than show stale
   or wrong results.
7. Try writing your own rule from scratch using `LANGUAGE.md` as a
   reference, to convince yourself you actually understand the syntax (and
   so you can answer questions about it).

## Part 2 — Interface tour (so you know exactly where to click while filming)

**Landing page (opens first)** — 3 slides: a minimal title slide with a
decode/glitch text animation, a "why this exists" slide with the
today-vs-PulseQL comparison, and a "try it in 30 seconds" slide. Dots at
the bottom let you jump between slides; the button reads "Next →" until
the last slide, then becomes "Open the playground →".

**Header (very top of the tool)**
- Left: the **PulseQL** logo, a small "DSL compiler" badge, and a line
  underneath showing the currently-loaded example's name and a
  one-sentence description — updates the moment you change the dropdown.
- Right side: the **"Load example"** dropdown — swaps which of the 5
  built-in rules (4 real examples + 1 blank template) is loaded into the
  editor.
- Far right: a **"❓ How to use this"** button — opens a slide-in panel
  from the right with a step-by-step guide and a mini glossary. Good to
  point out in the video ("and if a judge opens this without me, there's a
  help button right here").

**Two top-level tabs, just under the header**
- **"✏️ Write & Test"** (the default) and **"🔄 See it Translated."** Only
  one is visible at a time — this is the main navigation of the whole
  page, and worth calling out explicitly on camera the first time.

**Tab 1 — "Write & Test" — two boxes side by side**
- **Left box, "Write the rule":** the rule editor. Syntax-highlighted
  (pink = keywords, green = strings, yellow = numbers), with gray inline
  comments next to each line explaining what it checks and suggesting
  numbers to try. Directly under it: a **status bar** — green ✓ when the
  rule parses correctly (name, priority, time window, tags), red ✗ with
  the specific error if something's broken.
- **Right box, "Live results":** a count at the top ("`N / 7 sample
  readings matched this rule`"), then 7 rows — one per sample sensor
  reading — each with a colored badge (**MATCH** green, **no match** gray,
  **ERROR** red) and a plain-English label. Edit any number on the left
  and this updates instantly — the single best thing to demonstrate on
  camera, since it proves the tool is really running, not displaying
  pre-made screenshots.

**Tab 2 — "See it Translated" — one full-width box**
- Three pill-shaped buttons: **Home Assistant**, **Node-RED**, **IFTTT**.
  Click any to see that platform's version of the current rule.

**Footer (very bottom)**
- One line noting it's zero-install, with links to `LANGUAGE.md` (full
  syntax reference) and `GLOSSARY.md` (every term explained).

### Suggested filming path

1. Start on the landing page's minimal title slide, let the decode
   animation play, click through the 3 slides, then "Open the playground".
2. Land on the default-loaded "Motion-Activated Lighting" example, on the
   "Write & Test" tab — don't touch anything yet, let viewers see the
   initial state.
3. Narrate the left box (the rule, in plain words, mention the inline
   comments).
4. Edit a number in the left box live, and hold the camera on the right
   box so the viewer visibly sees a row flip from "no match" to "MATCH"
   (or vice versa) with zero delay.
5. Click the **"🔄 See it Translated"** tab, then click through its 3
   pill buttons.
6. Optionally switch the dropdown back on "Write & Test" to a second
   example (e.g. "Leak Prevention") to prove it isn't a one-off demo.
7. Cut to the terminal for the CLI portion (see `DEMO_SCRIPT.md`).
