# GradeScript

**Write your grading policy once. Get a live calculator, a syllabus paragraph, a spreadsheet formula, and an LMS config — automatically.**

## The problem

Most online grade calculators make you type your whole policy into a form
**every single time** you use them — categories, weights, late penalties,
all re-entered from scratch. GradeScript is a small domain-specific
language for expressing a grading policy **once**, in plain, readable
syntax:

```
class Biology {
  category Homework = 15%
  category Tests = 40%
  category Labs = 25%
  category Final = 20%

  late Homework: max 70%
  retake Tests: max 80%
}
```

That one policy becomes a live grade calculator (with a reverse solver —
"what do I need on the Final?"), a plain-English syllabus paragraph, a
spreadsheet formula, and a Canvas-style LMS config — see
[`examples/`](examples/) for the generated output, or paste it into the
playground yourself.

## Quickstart (zero install)

There is no build step and no dependency to install.

- **Web playground:** open [`index.html`](index.html) directly in a
  browser (or serve the folder with any static file server — `node
  serve.js` is included, or `python -m http.server`). Build a policy with
  the table editor, watch your grade update live, and try the "what do I
  need?" solver.
- **Command line** (requires Node.js, no npm install):
  ```bash
  node cli.js compile examples/biology.gradescript
  node cli.js compile examples/biology.gradescript --target=spreadsheet
  node cli.js test examples/biology.gradescript sample-logs/logs.json
  ```
- **Test suite:** `node test-smoke.js` runs every example policy through
  the parser, all three code generators, and the calculator against
  sample grade entries, and reports pass/fail.

## How it works

GradeScript is a real compiler pipeline, not a template engine:

1. **Lexer** (`engine.js: tokenize`) — turns source text into tokens
   (keywords, identifiers, percentages, punctuation).
2. **Parser** (`engine.js: parse`) — a recursive-descent parser that
   builds an AST for each `class` block: its categories, late policies,
   and retake policies.
3. **Interpreter / calculator** (`engine.js: computeGrade`,
   `solveForTarget`) — walks the AST and computes a weighted grade against
   real grade entries, including a **reverse solver**: given a target
   grade, it solves backward for the minimum score needed in a specific
   category — most online grade calculators are forward-only and don't do
   this.
4. **Code generators** (`engine.js: toSyllabus`, `toSpreadsheet`,
   `toLMS`) — three independent backends that each walk the same AST and
   emit a different target format.

Because the calculator and all three code generators share one AST, a
policy is only ever *written* once — its meaning can't drift between the
number you see on screen and the formula you paste into a spreadsheet.

## The table editor

Typing raw code isn't the friendliest way to build a policy, so the
default view is a simple table — category name, weight, late cap, retake
cap, with an "Add category" button. Editing the table regenerates real
GradeScript source behind the scenes (viewable read-only in "View the
generated code"), which is compiled the normal way — the table is a
front-end for the language, not a separate system.

## The GPA Dashboard

Almost every online grade calculator only ever shows you one class. The
dashboard tab computes all 6 of the bundled default classes at once —
Biology, AP English, Algebra II, Intro CS, US History, Spanish I — and
shows an overall GPA across them, using the same standard 4.0 scale
(A = 4.0 down to F = 0.0). Every class lives in a stable "slot," so
renaming a class updates it in place everywhere (including the dashboard)
instead of creating a duplicate — only building a genuinely new class from
the blank template adds a new row.

## It remembers what you built

Everything you enter — every class, every rename, every average — is
saved to the browser's local storage as you go, and restored automatically
the next time you open the page. There's no account, no server, and
nothing leaves your browser; it's just `localStorage`, the same mechanism
any web app uses to remember your state between visits.

## Language reference

See [`LANGUAGE.md`](LANGUAGE.md) for the full grammar and metadata fields.

## Known limitations (honest, by design)

- **The reverse solver is conservative, not omniscient.** It solves for
  one target category at a time, assuming any *other* still-ungraded
  category scores 0% — the safe, guaranteed-achievable answer, not an
  optimistic one.
- **The LMS output's field names are illustrative.** They approximate
  real concepts (Canvas's weighted assignment groups, for example), but
  the exact schema would need to match a specific school's LMS admin API.
- **The GPA Dashboard reflects live edits for whichever class you're
  currently editing on the Build tab** (marked "editing live"), and shows
  the other 5 bundled classes with their own built-in sample data.

## Real-world impact

Teachers could use GradeScript to auto-generate the grading-policy
paragraph for a syllabus and a matching spreadsheet formula from the same
source, instead of writing both by hand and risking them saying different
things. Students get a real calculator without re-entering their policy
every time, plus the reverse solver most calculators don't offer.
Extending GradeScript with more backends (e.g. a PowerSchool-style export,
a Notion database template) means writing one more code generator function
against the existing AST — no changes to the language or to existing
policies.

## Project structure

```
engine.js          lexer, parser, calculator, 3 code generators (the language itself)
index.html/app.js  web playground: table editor, code preview, live results, dashboard
cli.js             command-line compiler + calculator
examples/          six real grading policies
sample-logs/       sample JSON grade entries used by the interpreter's test runner
test-smoke.js      end-to-end test: parses + compiles + runs every example
LANGUAGE.md        full syntax reference
DEMO_SCRIPT.md       5-minute demo video script
SUBMISSION_NOTES.md  judging-rubric mapping + submission checklist
GLOSSARY.md          every unfamiliar term explained plainly
TESTING_AND_TOUR.md  how to test it yourself + full interface tour for filming
```
