# Testing it yourself + interface tour (for filming)

## Part 1 — Test it yourself, step by step

You need Node.js installed. No other install is required.

1. Open a terminal and go to the project folder:
   ```bash
   cd path/to/ShieldQL
   ```
2. Run the automated test suite. This parses all 6 example policies,
   compiles each to syllabus/spreadsheet/LMS format, and runs the
   calculator against sample grade entries — it should print `ALL OK`:
   ```bash
   node test-smoke.js
   ```
3. Try the command-line compiler yourself:
   ```bash
   node cli.js compile examples/biology.gradescript
   node cli.js compile examples/biology.gradescript --target=spreadsheet
   node cli.js test examples/biology.gradescript sample-logs/logs.json
   ```
4. Open the web playground. Either double-click `index.html`, or serve it
   properly (recommended, avoids browser file-access quirks):
   ```bash
   node serve.js
   ```
   then open `http://localhost:5173` in a browser.
5. In the playground: click through the landing slides, pick each class
   from the dropdown, edit a weight in the table and watch the grade
   update, try the "What do I need?" solver, then check the "See it
   Translated" and "GPA Dashboard" tabs.
6. Break something on purpose: delete every category from a policy, or
   set a weight to a huge number — the status bar and weight-total
   indicator should react clearly, not silently show something wrong.
7. Try building your own class from scratch using the "✏️ Start your own
   (blank)" entry in the dropdown, to convince yourself the table editor
   actually works for a real use case, not just the presets.

## Part 2 — Interface tour (so you know exactly where to click while filming)

**Landing page (opens first)** — 3 slides: a minimal title slide with a
letter-by-letter reveal, a "why this exists" slide with the
typical-calculator-vs-GradeScript comparison, and a "try it in 30
seconds" slide. Dots at the bottom navigate; the button reads "Next →"
until the last slide, then becomes "Open the playground →".

**Header** — Left: the **GradeScript** logo, a "DSL compiler" badge, and
a line showing the currently-loaded class's name and a one-sentence
description. Right: the **"Load class"** dropdown (6 classes + blank
template) and a **"❓ How to use this"** help button.

**Three top-level tabs, just under the header**

**Tab 1 — "📊 Build" — two boxes side by side**
- **Left box, "Build the policy":** a class-name field, then a table —
  Category / Weight / Late cap / Retake cap / delete button — with an
  "+ Add category" button and a live weight-total indicator (turns green
  at exactly 100%). Below that, a collapsed **"👀 View the generated
  code"** disclosure showing the real compiled source, read-only.
- **Right box, "Live results":** a big animated grade number and letter,
  a reassuring caption, best/worst case, a category breakdown table, and
  the **"🎯 What do I need?"** reverse-solver widget — pick a category
  and a target grade, get the minimum score needed.

**Tab 2 — "🔄 See it Translated" — one full-width box**
- Three pill buttons: **Syllabus**, **Spreadsheet**, **LMS Config**.

**Tab 3 — "🎓 GPA Dashboard" — one full-width box**
- A big overall GPA number, then a table of all 6 default classes with
  their current grade, letter, and GPA points.

**Footer** — Zero-install note, links to `LANGUAGE.md` and `GLOSSARY.md`.

### Suggested filming path

1. Start on the landing page's title slide, click through all 3 slides,
   then "Open the playground".
2. Land on Biology, on the "Build" tab — read the table out loud.
3. Click "View the generated code" briefly, then close it.
4. Use the "What do I need?" solver with a couple of different targets.
5. Edit a weight in the table live, point at the grade updating.
6. Click "🔄 See it Translated" → click through all 3 pill buttons.
7. Click "🎓 GPA Dashboard" → point at the overall GPA.
8. Cut to the terminal for the CLI portion (see `DEMO_SCRIPT.md`).
