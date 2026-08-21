# GradeScript language reference

## A class

Every GradeScript source file (or playground state) is one or more `class`
blocks:

```
class <Name> {
  category <Name> = <percent>%
  category <Name> = <percent>%
  ...

  late <Category>: max <percent>%      // optional, any number of these
  retake <Category>: max <percent>%    // optional, any number of these
}
```

- `<Name>` is a bare identifier (letters, digits, underscore; must not
  start with a digit). The table editor sanitizes friendly text like
  "Extra Credit" into a valid identifier (`Extra_Credit`) automatically.
- At least one `category` line is required.
- `late` and `retake` lines are optional metadata attached to a category
  by name — they don't need to appear in any particular order relative to
  the categories.
- Category weights don't have to sum to exactly 100 while you're
  experimenting — the tools will warn you, not refuse to compile.

## Grammar

```
program   := class+
class     := "class" IDENT "{" statement* "}"
statement := category | late | retake
category  := "category" IDENT "=" PERCENT
late      := "late" IDENT ":" "max" PERCENT
retake    := "retake" IDENT ":" "max" PERCENT
```

There is no boolean expression language in GradeScript — unlike a rules
DSL, a grading policy is a flat declaration, not a condition to evaluate.
That's a deliberate simplicity choice, not a missing feature.

## Literals

- **Percent:** a number immediately followed by `%` with no space — `15%`,
  `100%`, `0.5%`. This is the only numeric literal the language has; plain
  numbers without a `%` aren't valid anywhere in a `class` block.

## Comments

`// ...` runs to the end of the line. There are no block comments.

## Full example

```
// BIOLOGY — a typical weighted-category grading policy
class Biology {
  category Homework = 15%
  category Tests = 40%
  category Labs = 25%
  category Final = 20%

  late Homework: max 70%
  retake Tests: max 80%
}
```

## The calculator (not part of the grammar, but part of the language's meaning)

A `class` on its own is just a policy. To get a grade, it's evaluated
against a list of grade entries — plain JSON objects, not GradeScript
source:

```json
{ "category": "Homework", "score": 92 }
{ "category": "Homework", "score": 58, "late": true }
{ "category": "Tests", "score": 85, "isRetake": true }
```

`late: true` applies the category's late cap (if one exists) to that
entry's score; `isRetake: true` applies the retake cap the same way.
`computeGrade` averages entries within each category, then computes a
weighted overall grade — see `README.md`'s "How it works" for the full
pipeline, and `engine.js` for the actual math (it's short).

## Grammar notes for the curious

- The lexer, parser, calculator, and all three code generators live in a
  single dependency-free file, [`engine.js`](engine.js), so the whole
  language implementation is readable top to bottom in one sitting.
- The parser is a straightforward recursive-descent implementation — no
  parser generator or grammar DSL involved, which keeps error messages
  precise (`ParseError` and `LexError` carry line/column information).
- The calculator and all three code generators walk the *same* AST
  produced by the parser — none of them re-parses or re-derives it —
  which is what guarantees the number on screen and the formula you paste
  into a spreadsheet can't quietly disagree with each other.
