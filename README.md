# ShieldQL

**Write one detection rule. Get Splunk SPL, Sigma YAML, and Elastic EQL — automatically.**

Built for [Syntax Summit](https://syntax-summit.devpost.com/).

## The problem

Security teams write the same detection logic three or four times: once for
Splunk (SPL), once for Sigma (the vendor-neutral sharing format), once for
Elastic (EQL), sometimes again for a fourth tool. Every rewrite is a chance
to introduce a subtle bug or let one platform's rule set drift out of sync
with the others.

ShieldQL is a small domain-specific language for expressing a detection rule
**once**, in plain, readable syntax, and compiling it to the query languages
real security tools use.

```
rule CredentialStuffing {
  when event.type == "login"
    and event.failed_attempts >= 5
    and event.country != user.home_country
  within 10m
  severity: high
  tags: "credential-stuffing", "brute-force", "authentication"
  description: "Multiple failed logins followed by access from an unexpected country within 10 minutes"
}
```

That one rule becomes real Splunk SPL, real Sigma YAML, and real Elastic
EQL — see [`examples/`](examples/) for the generated output, or paste it
into the playground yourself.

## Quickstart (zero install)

There is no build step and no dependency to install.

- **Web playground:** open [`index.html`](index.html) directly in a browser
  (or serve the folder with any static file server — `node serve.js` is
  included, or `python -m http.server`). Pick an example from the dropdown,
  edit it, and watch the compiled output and live test results update as
  you type.
- **Command line** (requires Node.js, no npm install):
  ```bash
  node cli.js compile examples/credential-stuffing.shieldql
  node cli.js compile examples/credential-stuffing.shieldql --target=sigma
  node cli.js test examples/credential-stuffing.shieldql sample-logs/logs.json
  ```
- **Test suite:** `node test-smoke.js` runs every example rule through the
  parser, all three code generators, and the interpreter against the sample
  log events, and reports pass/fail.

## How it works

ShieldQL is a real compiler pipeline, not a template engine:

1. **Lexer** (`engine.js: tokenize`) — turns source text into tokens
   (keywords, identifiers, string/number/duration literals, operators).
2. **Parser** (`engine.js: parse`) — a recursive-descent parser that builds
   an AST for each `rule` block, with proper operator precedence for
   `or` / `and` / `not` / comparisons and parenthesized grouping.
3. **Interpreter** (`engine.js: runRule`) — walks the AST and evaluates a
   rule's `when` expression against a real JSON event, so you can dry-run a
   rule against sample data before shipping it anywhere. This is what
   powers the "live test run" panel in the playground.
4. **Code generators** (`engine.js: toSplunk`, `toSigma`, `toElasticEQL`) —
   three independent backends that each walk the same AST and emit a
   different target language.

Because the interpreter and all three code generators share one AST, a rule
is only ever *written* once — its meaning can't drift between targets.

## Language reference

See [`LANGUAGE.md`](LANGUAGE.md) for the full grammar, operators, and
metadata fields.

## Known limitations (honest, by design)

Real security query languages aren't equally expressive, so the code
generators are explicit — via inline comments in their output — about where
a translation is lossy:

- **Sigma** has no native way to compare two event fields to each other
  (e.g. `event.country != user.home_country`). Rules that rely on
  field-to-field comparisons, `or`, or `not` are flagged in the generated
  YAML with a `# NOTE:` comment instead of silently producing an incorrect
  rule.
- **Splunk SPL** handles field-to-field comparisons via an `eval` clause,
  which the generator emits, but flags with a note since it changes how the
  clause should be reviewed.
- **Elastic EQL** natively supports field-to-field comparisons and boolean
  logic, so it's the most complete of the three backends. Time windows
  (`within`) are emitted as a comment, since EQL applies time bounds via the
  Kibana time range picker rather than inline syntax.

This is deliberate: a compiler that silently produces a subtly wrong
security rule is worse than one that tells you where you need to double
check its work.

## Real-world impact

A SOC (security operations center) rarely runs just one tool. ShieldQL's
model — one source of truth, many compiled targets — is the same idea
behind Sigma itself (which only targets SIEM query languages, not also
interpreting rules locally) and behind infrastructure-as-code tools like
Terraform (one config, many cloud providers). Extending ShieldQL with more
backends (e.g. YARA, Suricata, or a new SIEM) means writing one more code
generator function against the existing AST — no changes to the language or
to existing rules.

## Project structure

```
engine.js          lexer, parser, interpreter, 3 code generators (the language itself)
index.html/app.js  web playground (loads engine.js directly, no build step)
cli.js             command-line compiler + test runner
examples/          four real detection rules
sample-logs/       sample JSON events used by the interpreter's test runner
test-smoke.js      end-to-end test: parses + compiles + runs every example
LANGUAGE.md        full syntax reference
DEMO_SCRIPT.md       5-minute demo video script
SUBMISSION_NOTES.md  judging-rubric mapping + submission checklist
GLOSSARY.md          every unfamiliar term explained plainly
TESTING_AND_TOUR.md  how to test it yourself + full interface tour for filming
```
