# Demo video script — full feature tour, ~5 minutes

This one is paced to actually hit every real feature in the app, not just
the highlights — it's tighter and faster-moving than a "just the greatest
hits" script. Practice it 2-3 times out loud with a timer before you
record; it's built to fit 5:00 exactly at a brisk, confident reading pace,
but everyone's natural pace differs slightly.

Every unfamiliar term is still defined the moment it's said. Nothing here
name-drops a specific award category on purpose.

Before recording: open a fresh browser tab at `index.html` (or `node
serve.js` → `http://localhost:5173`) so the first thing on screen is the
landing page. Have a terminal ready for the CLI beat near the end.

**Layout note:** three top-level tabs — **"📊 Build"** (table editor +
live grade, default), **"🔄 See it Translated"** (syllabus/spreadsheet/LMS),
**"🎓 GPA Dashboard"** (every class at once).

---

## [0:00–0:15] Cold open

> "Hi, I'm [your name]. This is GradeScript — a real programming language
> for grading policies, built for Build Beyond. Let me show you everything
> it does."

## [0:15–0:45] The landing page

*[Screen: landing page — title, tagline, the comparison, the "try it in 30 seconds" steps]*

> "Before I click in — every online grade calculator makes you re-type
> your whole policy from scratch, every single time you use it.
> GradeScript fixes that: write the policy once, and it becomes a live
> calculator, a syllabus paragraph, a spreadsheet formula, an LMS config,
> and a GPA dashboard across every class you build — all from one source,
> guaranteed to agree with each other. This page even lays out exactly
> what to try before I click in. Let's go."

*[Action: click through the slides, then "Open the playground →"]*

## [0:45–1:10] Quick header tour

*[Screen: point at each header element in turn]*

> "Top left, the project name. Top right, a dropdown — six real classes
> are pre-loaded, plus a blank template to build your own from scratch.
> Right under it, a line always tells you which class you're on and what
> it does. And this help button opens a full guide and glossary any time —
> no need to ask me."

*[Action: briefly open the help panel, then close it]*

## [1:10–1:55] The policy table

*[Screen: point at the class name field, then the table]*

> "This left panel is the whole policy. I can rename the class right
> here —"

*[Action: type over the class name]*

> "— watch, that updates everywhere else in the app instantly, including
> the dropdown itself. Below it: every category, its weight, an optional
> late cap so a late assignment isn't an automatic zero, and an optional
> retake cap. I can add a category, or delete one —"

*[Action: click "+ Add category", then delete a row]*

> "— and this total turns green the moment my weights actually add up to
> 100%, and warns me if they don't."

## [1:55–2:15] Proof it's real

*[Action: click "👀 View the generated code"]*

> "None of this is fake — that's real GradeScript source underneath, and
> it's re-parsed by an actual compiler every single time I type. This is a
> language with a friendly front end, not a form pretending to be one."

## [2:15–2:55] The live grade

*[Screen: point at the right panel's category rows]*

> "Over here, my live grade. Each category has a box where I type my
> actual average — 80 for Homework, say. Leave one blank, or type 'N/A,'
> and it's treated as not-started, not as a zero."

*[Action: type a number into the Final category's box]*

> "Watch the number animate as I type — instant, no submit button. Below
> it: worst case and best case, if everything I haven't finished yet goes
> terribly or perfectly."

## [2:55–3:20] The reverse solver

*[Action: point at the solver widget, type a target like 90]*

> "And here's the part almost no calculator has: I ask what I need on the
> Final to hit 90%, and it solves backward for the exact minimum score —
> or tells me honestly if that's already locked in no matter what, or if
> it's flat-out not reachable through that one category alone. Real
> algebra, not a guess."

## [3:20–3:50] See it translated

*[Action: click "🔄 See it Translated", then click through all three sub-tabs]*

> "Same policy, three more formats, none hand-written: a syllabus
> paragraph a teacher could paste straight into a course page, a real
> spreadsheet formula for Google Sheets, and a config shaped like what a
> school's LMS — Canvas, for example — actually uses for weighted
> categories."

## [3:50–4:20] The GPA Dashboard

*[Action: click "🎓 GPA Dashboard"]*

> "Every calculator I've found only ever shows one class. This shows every
> class at once, converts each grade to GPA points on the standard 4.0
> scale, and averages them into one number — [point at it]. And it's not
> stuck at six: build a brand-new class from the blank template, and it
> shows up here too, live, right alongside the rest, marked as the one
> I'm actively editing."

## [4:20–4:40] It remembers everything

*[Action: back on "Build," rename the class again, then press F5 to refresh the whole page]*

> "One more thing: I'll rename this and refresh the entire page —"

*[Action: point at everything still correct after reload]*

> "— and it's all exactly how I left it. No login, no server — just saved
> automatically in the browser itself, every time you type."

## [4:40–5:00] CLI, error handling, and close

*[Screen: switch to terminal]*

> "There's a command-line version too — same compiler, from a terminal."

*[Action: run `node cli.js test examples/biology.gradescript sample-logs/logs.json`, then switch back to the browser and briefly type something invalid into the editor]*

> "And if I break the syntax on purpose, it tells me exactly what's wrong
> instead of failing silently. That's GradeScript — describe your policy
> once, trust it everywhere. Thanks for watching."

---

## Cheat-sheet: what to actually click, in order

1. Landing page → click through all 3 slides → "Open the playground →"
2. Point at dropdown → open help panel → close it
3. Rename the class in the table → point at the dropdown/description updating
4. Click "+ Add category" → delete a row → point at the weight total
5. Click "👀 View the generated code"
6. Type an average into a category box (e.g. Final) → point at the grade
   animating
7. Use the "🎯 What do I need?" solver
8. Click "🔄 See it Translated" → click through Syllabus / Spreadsheet /
   LMS Config
9. Click "🎓 GPA Dashboard" → point at the overall GPA
10. Back on "Build" → rename again → press F5 → point out nothing was lost
11. Terminal: run the `node cli.js test ...` command
12. Back in browser: break the syntax on purpose → point at the error
    message
13. Close on the "describe your policy once" line

## If you get a question you don't expect

- **"Is the GPA Dashboard live-linked to what I edit on the Build tab?"**
  — "Yes — whichever class you're actively editing is marked 'editing
  live' and updates instantly. New or renamed classes show up there too,
  not just the 6 defaults."
- **"How does the reverse solver handle more than one ungraded
  category?"** — "It solves for whichever one you pick, conservatively
  assuming any *other* still-ungraded category scores zero — the safe,
  guaranteed-achievable answer, not an optimistic one."
- **"What happens with a category name that has a space, like 'Extra
  Credit'?"** — "It's sanitized into a valid identifier automatically —
  'Extra_Credit' — behind the scenes, while the table keeps showing what
  you actually typed."
- **"Can this be extended to more formats?"** — "Yes — everything reads
  from one shared parsed structure, so a new target is one new function,
  not a language change."
- **"Where is the saved data stored?"** — "The browser's `localStorage` —
  the same standard mechanism any web app uses. Nothing is sent anywhere;
  it never leaves your machine."
