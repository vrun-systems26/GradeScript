# Glossary — every unfamiliar word, explained simply

If a term in the README, the playground, or the video script is unfamiliar,
it's here.

## The security tools

**Splunk** — A company (and the tool it sells) that reads huge piles of
computer activity logs — every login, every file opened, every network
connection — and lets a person search through them and set up alarms. One
of the oldest and most widely used tools for this job. Its query language
is called **SPL** (Search Processing Language).

**Elastic** — A different company that makes a similar tool, built on top
of their own database technology called **Elasticsearch**. Its detection
query language is called **EQL** (Event Query Language).

**Sigma** — Not a company and not a tool you run. It's a free, open,
shared *format* for writing down a detection idea — plain YAML text — so
that a security researcher who finds a new attack pattern can publish one
Sigma rule, and anyone using Splunk, Elastic, or another tool can convert
it into their own tool's language. There's a public library of these
called SigmaHQ.

**SIEM** ("Security Information and Event Management") — The general
category of tool that Splunk and Elastic both belong to: software that
collects logs from everywhere in a company and helps a team watch for
trouble.

**SOC** ("Security Operations Center") — The team of people at a company
whose job is to watch the SIEM and respond when something looks like an
attack.

## The programming/compiler terms

**DSL** ("Domain-Specific Language") — A small programming language built
for exactly one job, instead of a general-purpose language like Python or
JavaScript that can do anything. ShieldQL is a DSL: all it can do is
describe a security detection rule, and it does that one job well.

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
in ShieldQL's case, checking whether a rule's logic is true or false for a
given security event. This is what powers the live "MATCH / no match"
test panel in the playground.

**Compiler** — A program that translates code written in one language into
another language (often a lower-level one a computer can run directly).

**Transpiler** — A specific kind of compiler that translates from one
*high-level* language to another (as opposed to translating down to raw
machine code). ShieldQL's Splunk/Sigma/Elastic generators are transpilers:
they turn one high-level rule into three other high-level languages.

**Grammar** — The set of rules that says what counts as a legal sentence in
a language. ShieldQL's grammar (in `LANGUAGE.md`) says things like "a rule
must have exactly one `when` clause" and "`and` binds tighter than `or`."

**Recursive descent parser** — A common, simple way to build a parser by
hand: one function per grammar rule, where the functions call each other
(and sometimes themselves) following the shape of the grammar. This is how
ShieldQL's parser is built — no external parser-generator tool involved.

## Other terms that show up

**YAML** — A plain-text format for writing structured data (lists,
key-value pairs) that's easy for humans to read. Sigma rules are written
in YAML.

**CLI** ("Command-Line Interface") — Running a program by typing a command
into a terminal instead of clicking buttons in a browser. ShieldQL has one
(`cli.js`) in addition to the web playground.

**Repo** (short for "repository") — A project's folder of code, tracked by
a version-control tool called Git, usually hosted somewhere like GitHub so
others can see and download it. Devpost submissions require a link to one.

**Zero-dependency / zero-install** — Means the project doesn't need you to
download or install anything else to run it — no `npm install`, no
package manager, no build step. Just open the file.
