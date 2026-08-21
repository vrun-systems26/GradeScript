# PulseQL

**Write one home-automation rule. Get Home Assistant YAML, a Node-RED flow, and an IFTTT Applet — automatically.**

Built for [Syntax Summit](https://syntax-summit.devpost.com/).

## The problem

Every smart-home platform wants your automation logic written its own way.
Home Assistant wants YAML. Node-RED wants a wired-together graph of nodes.
IFTTT wants a simple Applet. If you actually want the same automation
working across more than one of these — a very normal thing to want, since
platforms get swapped, combined, or run side by side — you end up
hand-writing the same idea three separate times. Every rewrite is a chance
to introduce a subtle bug or let one platform's version drift out of sync
with the others.

PulseQL is a small domain-specific language for expressing a home/building
automation rule **once**, in plain, readable syntax, and compiling it to
the formats real smart-home platforms use.

```
rule LeakPrevention {
  when sensor.type == "water"
    and sensor.leak_detected == true
    and home.alert_acknowledged == false
  within 3m
  severity: critical
  tags: "safety", "water-damage"
  description: "Shut off the main water valve if a leak is detected and nobody has acknowledged it"
}
```

That one rule becomes real Home Assistant automation YAML, a real Node-RED
flow (JSON), and a real IFTTT Applet — see [`examples/`](examples/) for the
generated output, or paste it into the playground yourself.

## Quickstart (zero install)

There is no build step and no dependency to install.

- **Web playground:** open [`index.html`](index.html) directly in a browser
  (or serve the folder with any static file server — `node serve.js` is
  included, or `python -m http.server`). Pick an example from the dropdown,
  edit it, and watch the compiled output and live test results update as
  you type.
- **Command line** (requires Node.js, no npm install):
  ```bash
  node cli.js compile examples/leak-prevention.shieldql
  node cli.js compile examples/leak-prevention.shieldql --target=nodered
  node cli.js test examples/leak-prevention.shieldql sample-logs/logs.json
  ```
- **Test suite:** `node test-smoke.js` runs every example rule through the
  parser, all three code generators, and the interpreter against the sample
  sensor readings, and reports pass/fail.

## How it works

PulseQL is a real compiler pipeline, not a template engine:

1. **Lexer** (`engine.js: tokenize`) — turns source text into tokens
   (keywords, identifiers, string/number/duration literals, operators).
2. **Parser** (`engine.js: parse`) — a recursive-descent parser that builds
   an AST for each `rule` block, with proper operator precedence for
   `or` / `and` / `not` / comparisons and parenthesized grouping.
3. **Interpreter** (`engine.js: runRule`) — walks the AST and evaluates a
   rule's `when` expression against a real JSON sensor reading, so you can
   dry-run a rule against sample data before shipping it anywhere. This is
   what powers the "live test run" panel in the playground.
4. **Code generators** (`engine.js: toHomeAssistant`, `toNodeRED`,
   `toIFTTT`) — three independent backends that each walk the same AST and
   emit a different target format.

Because the interpreter and all three code generators share one AST, a rule
is only ever *written* once — its meaning can't drift between targets.

## Language reference

See [`LANGUAGE.md`](LANGUAGE.md) for the full grammar, operators, and
metadata fields.

## Known limitations (honest, by design)

Real smart-home platforms aren't equally expressive, so the code generators
are explicit — via inline comments in their output — about where a
translation is lossy:

- **Home Assistant** has no built-in way to run arbitrary compound boolean
  logic as a single trigger, so the generator uses a `platform: template`
  trigger with a Jinja-style expression — genuinely how complex conditions
  are handled in real Home Assistant configs — and flags with a note that
  the field names need to be wired to real entity IDs (e.g.
  `states('binary_sensor.motion')`) before use.
- **Node-RED** has no single built-in node for arbitrary compound logic
  either, so the generator emits a `function` node containing real
  JavaScript implementing the rule's logic — which is exactly how a real
  Node-RED user would handle this case, since function nodes genuinely do
  execute arbitrary JS.
- **IFTTT** is the most limited of the three: its Filter Code feature (a
  real IFTTT Pro capability) can run the same JavaScript condition, but
  IFTTT has no memory of previous runs, so it's flagged whenever a rule
  needs a real time window.
- **`within` is metadata, not a temporal engine.** A rule's `within 3m` is
  passed through to each target's own time-window mechanism where one
  exists (e.g. Home Assistant's `for:` key), but the local interpreter (the
  thing powering the playground's live test panel) evaluates a rule against
  **one sensor reading at a time** — it does not currently simulate a
  rolling window across a sequence of readings. If asked directly: no, the
  interpreter doesn't yet check whether a leak was actually unacknowledged
  for 3 real minutes; it checks whether a single sample reading's fields
  satisfy the rule. Real temporal correlation (state held across multiple
  readings) is a natural next step, not something this version claims to
  do.

This is deliberate: a compiler that silently produces a subtly wrong
automation rule is worse than one that tells you where you need to double
check its work.

## Real-world impact

Very few smart homes run just one platform — people mix Home Assistant with
Node-RED for the logic Home Assistant can't express cleanly, and plenty of
non-technical households only ever touch IFTTT. PulseQL's model — one
source of truth, many compiled targets — is the same idea behind
infrastructure-as-code tools like Terraform (one config, many cloud
providers). Extending PulseQL with more backends (e.g. openHAB, SmartThings,
Apple Shortcuts) means writing one more code generator function against the
existing AST — no changes to the language or to existing rules.

## Project structure

```
engine.js          lexer, parser, interpreter, 3 code generators (the language itself)
index.html/app.js  web playground (loads engine.js directly, no build step)
cli.js             command-line compiler + test runner
examples/          four real automation rules
sample-logs/       sample JSON sensor readings used by the interpreter's test runner
test-smoke.js      end-to-end test: parses + compiles + runs every example
LANGUAGE.md        full syntax reference
DEMO_SCRIPT.md       5-minute demo video script
SUBMISSION_NOTES.md  judging-rubric mapping + submission checklist
GLOSSARY.md          every unfamiliar term explained plainly
TESTING_AND_TOUR.md  how to test it yourself + full interface tour for filming
```
