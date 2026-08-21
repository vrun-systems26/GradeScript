# Demo video script — full narration, ~5 minutes

This is written so you can basically read it out loud and it'll make sense
to someone who has never seen this project before. Practice it 2-3 times
so it sounds like you, not like you're reading — but the words are all
here so you don't have to improvise definitions on the spot.

Every unfamiliar term is defined **the moment it's said**. Nothing in this
script name-drops a specific award category on purpose — the goal is for
the substance to make the case, not the pitch.

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

> "Hi, I'm [your name]. This is GradeScript, my project for Build
> Beyond."

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

## [1:00–1:45] The table editor — and proof it's real

*[Screen: the "📊 Build" tab, active by default, pointing at the table]*

> "This is Biology, one of six classes loaded by default. This table is
> the whole policy: Homework is worth 15%, Tests 40%, Labs 25%, Final 20%.
> If homework comes in late, it's capped at 70% instead of zero. Tests can
> be retaken, capped at 80%.
>
> No code, no syntax to learn — just a table. But it's not a fake mockup:
> click 'View the generated code' —"

*[Action: click "View the generated code"]*

> "— and that's a real, compiling program underneath. Editing the table
> regenerates this text and re-runs it through an actual parser every time
> you type. This isn't a form bolted onto a static page — it's a language
> with a friendly front end."

## [1:45–2:30] The live grade

*[Screen: point at the right panel — category rows have real number
inputs, pre-filled with example numbers you can overwrite]*

> "Each category has a box where I type my actual average so far — right
> now Homework's at 80, Tests at 77. That's what drives the number up top:
> [read the number and letter]. Below it, best case and worst case if
> everything ungraded goes perfectly or terribly."

*[Action: click into the Final category's box, type a number]*

> "Watch — I type a number into Final, and the grade updates instantly,
> live, as I type. No submit button."

*[Action: edit a category weight in the table live]*

> "Same thing if I change a weight — [point at grade updating] — every
> number on this screen is recalculated live, every keystroke."

## [2:30–3:00] The reverse solver — the big moment

*[Action: point at the solver widget, type a target grade like 90]*

> "Here's the part almost no other calculator has. I just asked: what do
> I need on the Final to get a 90% overall? It solved backward and told me
> the exact minimum score. Every calculator I've tried only goes forward —
> enter scores, get an average. This one answers the question people
> actually ask their teacher: 'what do I need on the final?' — because
> under the hood it's not just averaging, it's solving an equation."

## [3:00–3:35] See it translated

*[Action: click "🔄 See it Translated"]*

> "Same policy, three more formats — and this is the part that's genuinely
> hard to fake: watch me click through all three, and every single one
> stays consistent with what I just typed, because they're not written
> separately — they're generated from the same parsed structure."

*[Action: click "Spreadsheet", then "LMS Config"]*

> "A real spreadsheet formula you could paste into Google Sheets right
> now. And a config shaped like what a school's learning management
> system — Canvas, for example — uses for weighted assignment groups."

## [3:35–4:05] The GPA Dashboard

*[Action: click "🎓 GPA Dashboard"]*

> "This is the feature I'm most proud of. Every grade calculator I've ever
> seen only shows you one class. This shows all six of my default classes
> at once, converts each grade to GPA points on the standard 4.0 scale,
> and averages them into one overall GPA — [point at the big number].
> Nobody else does this in a browser-based calculator."

## [4:05–4:25] It remembers everything — no login, no server

*[Action: rename a class in the table, e.g. type over "Biology" with something else, then press F5 to refresh the whole page]*

> "One more thing that surprises people: I just renamed this class and I'm
> about to refresh the entire page —"

*[Action: point at the class name and grade still showing correctly after refresh]*

> "— and it's all still exactly how I left it. No account, no login, no
> server anywhere. It's just saved in the browser itself, automatically,
> every time you type."

## [4:25–4:45] It's not just a website

*[Screen: switch to terminal]*

> "And it's not only a browser trick — there's a command-line version too,
> same compiler, straight from a terminal."

*[Action: run `node cli.js test examples/biology.gradescript sample-logs/logs.json`]*

## [4:45–5:00] Why it matters, and close

> "Teachers write grading policies by hand for a syllabus, separately
> build a spreadsheet, separately configure an LMS — three places for the
> same idea to quietly drift apart. GradeScript is one source of truth
> that every format gets generated from, the same idea behind tools that
> turned infrastructure config from copy-pasted scripts into something
> reliable. That's GradeScript — thanks for watching."

---

## Cheat-sheet: what to actually click, in order

1. Land on the welcome screen → talk over it → click **"Open the
   playground →"**
2. Point at the table on the "Build" tab → click "View the generated code"
   to prove it's real
3. Point at the live grade → type into the Final category's box → edit a
   weight → point at everything updating live
4. Use the "What do I need?" solver
5. Click **"🔄 See it Translated"** → click through Syllabus / Spreadsheet
   / LMS Config
6. Click **"🎓 GPA Dashboard"** → point at the overall GPA number
7. Back on "Build" → rename the class → press F5 to refresh the whole page
   → point out everything survived
8. Switch to terminal → run the `node cli.js test ...` command shown above
9. Close on the "why it matters" line

## If you get a question you don't expect

- **"Is the GPA Dashboard live-linked to what I edit on the Build tab?"**
  — "Yes — whichever class you're actively editing is marked 'editing
  live' on the dashboard and updates instantly. If you add or rename a
  class into something new, it shows up there too, not just the 6
  defaults."
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
- **"Where exactly is the saved data stored?"** — "The browser's
  `localStorage` — the same standard mechanism any web app uses to
  remember state between visits. Nothing is sent anywhere; it never
  leaves your machine."
