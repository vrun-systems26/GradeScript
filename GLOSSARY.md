# Glossary — every unfamiliar word, explained simply

If a term in the README, the playground, or the video script is
unfamiliar, it's here.

## Grading terms

**Category** — A graded bucket, like "Homework" or "Tests," that counts
for some percentage of your final grade.

**Weighted grade** — A grade where categories count different amounts. A
90% on a category worth 40% of your grade contributes more than a 90% on
one worth 10% — unlike just averaging every single assignment equally.

**Late cap** — Instead of a late assignment scoring a flat zero, it's
capped at some maximum (like 70%) — you still lose points, but partial
credit for late work is common in real classes.

**Retake cap** — Some categories (often tests or quizzes) let you retake
them for a better score, but usually capped below 100% so a retake isn't
"free" compared to getting it right the first time.

**GPA** ("Grade Point Average") — Letter grades converted to a number
(usually A = 4.0 down to F = 0.0) and averaged across classes, so you can
compare or combine grades from different classes on one scale.

**LMS** ("Learning Management System") — The software a school uses to
track grades and assignments, like Canvas or Google Classroom.

## The programming/compiler terms

**DSL** ("Domain-Specific Language") — A small programming language built
for exactly one job, instead of a general-purpose language like Python or
JavaScript that can do anything. GradeScript is a DSL: all it can do is
describe a grading policy, and it does that one job well.

**Lexer** (also "tokenizer") — The first step of reading code. It chops
raw text into small labeled pieces — "this is a word," "this is a
symbol," "this is a percentage" — without yet understanding what they
mean together.

**Parser** — The second step. It takes the lexer's pile of labeled pieces
and figures out the grammar — which pieces belong together, in what
order. The output is a tree (see AST below) representing the actual
meaning of what was written.

**AST** ("Abstract Syntax Tree") — A tree-shaped data structure that
represents the *meaning* of a piece of code, built by the parser. Once
you have the AST, you no longer need the original text — everything
downstream (calculating a grade, translating it, checking it) works from
the tree.

**Interpreter** — A program that walks an AST and actually *does*
something with it — in GradeScript's case, computing a real weighted
grade from a policy and a list of scores. This is what powers the live
"Live results" panel in the playground.

**Compiler** — A program that translates code written in one language
into another language.

**Transpiler** — A specific kind of compiler that translates from one
high-level language to another. GradeScript's syllabus/spreadsheet/LMS
generators are transpilers: they turn one high-level policy into three
other formats.

**Reverse solver** — Most calculators work forward: "here are my scores,
what's my average?" A reverse solver works backward: "here's the grade I
want, what score do I need to get it?" GradeScript's "🎯 What do I need?"
widget is a reverse solver.

**Recursive descent parser** — A common, simple way to build a parser by
hand: one function per grammar rule, where the functions call each other
following the shape of the grammar. This is how GradeScript's parser is
built — no external parser-generator tool involved.

## Other terms that show up

**CLI** ("Command-Line Interface") — Running a program by typing a
command into a terminal instead of clicking buttons in a browser.
GradeScript has one (`cli.js`) in addition to the web playground.

**Repo** (short for "repository") — A project's folder of code, tracked
by a version-control tool called Git, usually hosted somewhere like
GitHub so others can see and download it. Devpost submissions require a
link to one.

**Zero-dependency / zero-install** — Means the project doesn't need you
to download or install anything else to run it — no `npm install`, no
package manager, no build step. Just open the file.
