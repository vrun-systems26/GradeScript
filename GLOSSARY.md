# Glossary — every unfamiliar word, explained simply

If a term in the README, the playground, or the video script is unfamiliar,
it's here.

## The smart-home platforms

**Home Assistant** — The most popular open-source home automation platform.
People run it on a small computer at home; it connects to sensors and
smart devices, and you write "automations" — YAML rules like "if this
sensor changes, do that" — to control your house.

**Node-RED** — A visual automation tool. Instead of writing a script top to
bottom, you wire together small boxes called "nodes" on a canvas — one node
watches a sensor, another checks a condition, another triggers an action.
What gets saved behind the scenes is a JSON file describing that wiring.

**IFTTT** ("If This Then That") — A mainstream, beginner-friendly
automation app. Most non-technical people have at least heard of it. You
build small rules called "Applets": "if my phone enters this location,
then turn on my porch light."

## The programming/compiler terms

**DSL** ("Domain-Specific Language") — A small programming language built
for exactly one job, instead of a general-purpose language like Python or
JavaScript that can do anything. PulseQL is a DSL: all it can do is
describe a home-automation rule, and it does that one job well.

**Lexer** (also "tokenizer") — The first step of reading code. It chops raw
text into small labeled pieces — "this is a word," "this is a symbol,"
"this is a quoted string" — without yet understanding what they mean
together. Like sorting a sentence into individual words before you try to
understand the sentence.

**Parser** — The second step. It takes the lexer's pile of labeled pieces
and figures out the grammar — which pieces belong together, in what order,
with what structure. The output is a tree (see AST below) representing the
actual meaning of what was written.

**AST** ("Abstract Syntax Tree") — A tree-shaped data structure that
represents the *meaning* of a piece of code, built by the parser. Once you
have the AST, you no longer need the original text — everything downstream
(running the code, translating it, checking it) works from the tree.

**Interpreter** — A program that walks an AST and actually *executes* it —
in PulseQL's case, checking whether a rule's logic is true or false for a
given sensor reading. This is what powers the live "MATCH / no match"
test panel in the playground.

**Compiler** — A program that translates code written in one language into
another language (often a lower-level one a computer can run directly).

**Transpiler** — A specific kind of compiler that translates from one
*high-level* language to another (as opposed to translating down to raw
machine code). PulseQL's Home Assistant/Node-RED/IFTTT generators are
transpilers: they turn one high-level rule into three other formats.

**Grammar** — The set of rules that says what counts as a legal sentence in
a language. PulseQL's grammar (in `LANGUAGE.md`) says things like "a rule
must have exactly one `when` clause" and "`and` binds tighter than `or`."

**Recursive descent parser** — A common, simple way to build a parser by
hand: one function per grammar rule, where the functions call each other
(and sometimes themselves) following the shape of the grammar. This is how
PulseQL's parser is built — no external parser-generator tool involved.

## Other terms that show up

**YAML** — A plain-text format for writing structured data (lists,
key-value pairs) that's easy for humans to read. Home Assistant automations
are written in YAML.

**CLI** ("Command-Line Interface") — Running a program by typing a command
into a terminal instead of clicking buttons in a browser. PulseQL has one
(`cli.js`) in addition to the web playground.

**Repo** (short for "repository") — A project's folder of code, tracked by
a version-control tool called Git, usually hosted somewhere like GitHub so
others can see and download it. Devpost submissions require a link to one.

**Zero-dependency / zero-install** — Means the project doesn't need you to
download or install anything else to run it — no `npm install`, no
package manager, no build step. Just open the file.
