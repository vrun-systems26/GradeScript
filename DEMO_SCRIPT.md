# Demo video script — full narration, ~5 minutes

This is written so you can basically read it out loud and it'll make sense
to someone who has never seen this project before. Practice it 2-3 times
so it sounds like you, not like you're reading — but the words are all
here so you don't have to improvise definitions on the spot.

Every unfamiliar term is defined **the moment it's said**.

Before recording: open a fresh browser tab at `index.html` (or `node
serve.js` → `http://localhost:5173`) so the very first thing on screen is
the landing page. Have a terminal ready for the CLI part near the end.

**Layout note:** the tool has three top-level tabs: **"📊 Build"** (the
default — a table editor plus your live grade), **"🔄 See it
Translated"** (the same policy as a syllabus paragraph, spreadsheet
formula, and LMS config), and **"🎓 GPA Dashboard"** (all 6 bundled
classes at once, with an overall GPA).

---

## [0:00–0:15] Cold open

> "Hi, I'm [your name]. This is GradeScript, my project for Syntax
> Summit."

## [0:15–1:00] The landing page

*[Screen: the landing page — title, tagline, the "typical calculator vs GradeScript" comparison]*

> "Quick question: have you ever used an online grade calculator? Every
> single one makes you re-type your whole policy — every category, every
> weight — from scratch, every time you use it. That's the problem I'm
> solving.
>
> GradeScript is a tiny language where you write your grading policy
> **once**. From that one policy, you get a live calculator, a plain-
> English syllabus paragraph, a spreadsheet formula, and an LMS config —
> all generated automatically, all guaranteed to agree with each other,
> because they all come from the same source. Let's click in."

*[Action: click "Open the playground →"]*

## [1:00–1:20] First look

*[Screen: the "📊 Build" tab, active by default]*

> "This is Biology, one of six classes loaded by default. Up top: a
> dropdown to switch classes, and a help button. We're on the 'Build' tab
> — that's a table on the left, and my live grade on the right."

## [1:20–2:00] The table editor

*[Screen: point at the table]*

> "This is the whole policy: Homework is worth 15%, Tests 40%, Labs 25%,
> Final 20%. If homework comes in late, it's capped at 70% instead of
> zero. Tests can be retaken, capped at 80%.
>
> No code, no syntax to learn — just a table. But it's not fake: click
> 'View the generated code' — [action: click it] — and that's a real,
> compiling program underneath. Editing the table regenerates this text
> and re-runs it through an actual parser every time you type."

## [2:00–2:45] The live grade + the reverse solver (the big moment)

*[Screen: point at the right panel]*

> "Here's my grade right now: [read the number and letter]. Below it,
> best case and worst case if everything ungraded goes perfectly or
> terribly.
>
> Now here's the part almost no other calculator has: 'What do I need?'"

*[Action: point at the solver widget, type a target grade like 90]*

> "I just asked: what do I need on the Final to get a 90% overall? It
> solved backward and told me the exact minimum score. Most calculators
> only go forward — enter scores, get an average. This one answers the
> question people actually ask their teacher: 'what do I need on the
> final?'"

*[Action: edit a category weight in the table live]*

> "And it's all still live — watch what happens when I change a weight —
> [point at grade updating] — instantly recalculated, no save button."

## [2:45–3:30] See it translated

*[Action: click "🔄 See it Translated"]*

> "Same policy, three more formats. This is a syllabus paragraph a
> teacher could paste straight into their course syllabus."

*[Action: click "Spreadsheet"]*

> "This is a real spreadsheet formula — paste it into Google Sheets or
> Excel and it computes your grade from category averages."

*[Action: click "LMS Config"]*

> "And this approximates the kind of config a school's learning
> management system — Canvas, for example — uses for weighted assignment
> groups."

## [3:30–4:15] The GPA Dashboard

*[Action: click "🎓 GPA Dashboard"]*

> "This is the feature I'm most proud of. Every grade calculator I've
> ever seen only shows you one class. This shows all six of my default
> classes at once, converts each grade to GPA points on the standard 4.0
> scale, and averages them into one overall GPA — [point at the big
> number]. Nobody else does this in a browser-based calculator."

## [4:15–4:40] It's not just a website

*[Screen: switch to terminal]*

> "There's also a command-line version — same compiler, straight from a
> terminal."

*[Action: run `node cli.js test examples/biology.gradescript sample-logs/logs.json`]*

## [4:40–5:00] Why it matters, and close

> "Teachers write grading policies by hand for a syllabus, and separately
> build a spreadsheet, and separately configure an LMS — three places the
> same idea can drift apart. GradeScript means you describe the policy
> once, and trust it everywhere it needs to go. That's GradeScript —
> thanks for watching."

---

## Cheat-sheet: what to actually click, in order

1. Land on the welcome screen → talk over it → click **"Open the
   playground →"**
2. Point at the table on the "Build" tab, read a category or two out loud
3. Click "View the generated code" to prove it's real
4. Point at the live grade, then use the "What do I need?" solver
5. Edit a weight in the table → point at the grade updating live
6. Click **"🔄 See it Translated"** → click through Syllabus / Spreadsheet
   / LMS Config
7. Click **"🎓 GPA Dashboard"** → point at the overall GPA number
8. Switch to terminal → run the `node cli.js test ...` command shown above
9. Close on the "why it matters" line

## If you get a question you don't expect

- **"Is the GPA Dashboard live-linked to what I edit on the Build tab?"**
  — Answer honestly: "Not yet — the dashboard shows a snapshot of the 6
  default classes with their own sample data. That's stated in the
  dashboard's own caption, not hidden. Linking it to live edits is a
  natural next step."
- **"How does the reverse solver handle more than one ungraded
  category?"** — "It solves for whichever one category you pick,
  conservatively assuming any *other* still-ungraded category scores
  zero — the safe, guaranteed-achievable answer, not an optimistic one."
- **"What happens if I type a category name with a space, like 'Extra
  Credit'?"** — "It gets sanitized into a valid identifier automatically
  — 'Extra_Credit' — behind the scenes, while the table keeps showing
  what you actually typed."
- **"Can this be extended to more formats?"** — "Yes — everything reads
  from one shared parsed structure, so adding a new target is one new
  function, not a language change."
