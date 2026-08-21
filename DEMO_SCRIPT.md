# Demo video script — full narration, ~5 minutes

This is written so you can basically read it out loud and it'll make sense
to someone who has never seen this project before. Practice it 2-3 times so
it sounds like you, not like you're reading — but the words are all here so
you don't have to improvise definitions on the spot.

Every unfamiliar term is defined **the moment it's said**, not before or
after — so you never have to assume the viewer already knows what Home
Assistant, Node-RED, IFTTT, or a "rule" means.

Before recording: open a fresh browser tab at `index.html` (or `node
serve.js` → `http://localhost:5173`) so the very first thing on screen is
the landing page, not the tool itself. Have a terminal ready in the
background for the CLI part near the end.

**Layout note:** the tool has two top-level tabs at the top of the page:
**"✏️ Write & Test"** (the default view — the rule editor and the live test
results, side by side) and **"🔄 See it Translated"** (a second tab showing
the same rule compiled for Home Assistant, Node-RED, and IFTTT). You start
on the first tab and switch to the second partway through.

---

## [0:00–0:15] Cold open — before you even share your screen

> "Hi, I'm [your name]. This is PulseQL, my project for Syntax Summit."

## [0:15–1:00] The landing page (screen: the welcome screen, untouched)

*[Screen: the landing page — title, tagline, the "today vs PulseQL" comparison, green button]*

> "Before I touch any code, let me explain what this actually does.
>
> If you've set up any smart-home gadgets, you've probably run into one of
> three platforms: **Home Assistant**, the most popular open-source
> home-automation platform, where you write rules called 'automations' in a
> config format called YAML. **Node-RED**, a visual tool where instead of
> writing a script, you wire together little boxes on a canvas. Or
> **IFTTT** — 'If This Then That' — which most people have at least heard
> of, where you build simple rules called 'Applets.'
>
> Here's the problem: each of those three wants your automation idea
> written in a completely different way. So if you want the same idea
> working in more than one — which is really common, since people mix
> platforms — you end up writing it by hand three separate times. That's
> this picture right here [point at the comparison box]: one idea,
> hand-written three times, that can quietly drift out of sync.
>
> PulseQL fixes that. You write the automation once, in plain words, and it
> automatically produces all three versions for you. Let's click in."

*[Action: click "Open the playground →"]*

## [1:00–1:20] First look at the real interface

*[Screen: the tool, "✏️ Write & Test" tab active by default]*

> "Okay, now we're inside the actual tool. Up top: the project name, a
> dropdown to load different example rules, and a help button if anyone
> watching this wants a guide without me talking. Right under that,
> there's always a one-line description telling you exactly which example
> is loaded and what it does.
>
> There are two tabs at the top of the page. We're on 'Write & Test' right
> now — that's the rule editor and a live tester, side by side. There's a
> second tab, 'See it Translated,' that I'll switch to later."

## [1:20–2:00] The rule editor

*[Screen: point at the left box, "Write the rule"]*

> "This left box is where you write one automation — we call it a **rule**.
> This example is called Motion-Activated Lighting.
>
> Reading it out loud, in plain English: 'when a motion sensor detects
> movement, AND the room is dark, AND it's evening or later — turn on the
> lights.'
>
> That's it. No special training needed to read that. Notice there are
> even comments right next to each line, in gray, explaining what it does
> and suggesting numbers to try changing. And right below the box — [point]
> — this green checkmark line tells me instantly that what I wrote is
> valid, with no typos."

## [2:00–3:00] The live test panel (the big moment)

*[Screen: point at the right box, "Live results"]*

> "This right box is my favorite part. It's running this exact rule, right
> now, against 7 made-up example sensor readings — motion, temperature,
> water, soil moisture — and showing which ones it would trigger on. Right
> now it's correctly flagging the dark-evening motion reading and correctly
> ignoring the six that don't match.
>
> Now watch — I'm going to edit the rule live."

*[Action: click into the rule editor, change the light-level threshold, e.g. `< 20` to `< 90`]*

> "I just changed the rule to trigger on a much brighter room. Watch the
> list on the right — [point] — it instantly re-checked all 7 readings
> again, with no save button, no reload, nothing. That proves this is a
> real, working program thinking through my rule as I type it — not a
> video or a mockup."

## [3:00–3:45] Switching tabs — the three translations

*[Action: click the "🔄 See it Translated" tab at the top of the page]*

> "Now let's switch tabs. This is the same rule I was just editing,
> rewritten into three real smart-home formats. Watch me click through
> them."

*[Action: click "Home Assistant" tab]*

> "This is **Home Assistant's** format — remember, that's the most popular
> open-source home-automation platform. This is exactly what you'd paste
> into a Home Assistant config to make this automation real."

*[Action: click "Node-RED" tab]*

> "This is a **Node-RED** flow — remember, the visual wire-together tool.
> This JSON is exactly what Node-RED saves behind the scenes when you wire
> up nodes by hand — including a real function node with actual JavaScript
> implementing the logic, which is genuinely how you'd handle a rule this
> specific in Node-RED."

*[Action: click "IFTTT" tab]*

> "And this is an **IFTTT** Applet — the one almost everyone's heard of.
>
> I didn't write any of these three by hand — my program read the one
> plain rule and generated all three. And where a translation genuinely
> can't be done perfectly — like IFTTT having no memory of previous runs
> for time-based rules — it says so honestly instead of pretending it
> worked."

## [3:45–4:15] It's not just a website

*[Screen: switch to terminal]*

> "One more thing — this isn't only a webpage. There's also a
> command-line version, so this could run as part of an automated setup
> process."

*[Action: run `node cli.js compile examples/leak-prevention.shieldql --target=nodered`]*

> "Same program, same correct output, straight from the terminal."

## [4:15–5:00] Why it matters, and close

> "Very few smart homes run just one platform — people mix Home Assistant
> with Node-RED for the logic Home Assistant can't express cleanly, and
> plenty of households only ever touch IFTTT. PulseQL means you write your
> automation idea once, and trust it everywhere it needs to go. That's
> PulseQL — thanks for watching."

---

## Cheat-sheet: what to actually click, in order

1. Land on the welcome screen → talk over it → click **"Open the
   playground →"**
2. Point at the header (dropdown + help button) and the example
   description line — don't click yet
3. Point at the left box (the rule) — read it out loud, mention the inline
   comments
4. Point at the right box (live results) → click into the editor → change
   the light-level number → point at the results updating live
5. Click the **"🔄 See it Translated"** tab, top of page
6. Click **Home Assistant** → **Node-RED** → **IFTTT**, in that order
7. Switch to terminal → run the `node cli.js compile ...` command shown
   above
8. Close on the "why it matters" line — no need to go back on screen

## If you get a question you don't expect

You don't have to know everything — it's fine to say "that's a great
question, let me follow up" — but here are the ones most likely to come
up:

- **"Isn't this just a converter between existing formats?"** — "Fair
  question, but PulseQL isn't converting an existing Home Assistant config
  into Node-RED — it's a purpose-built *authoring* language with its own
  live tester built in, so you can prove a rule actually does what you
  want before you ever export it anywhere."
- **"What happens if the rule uses `or` or `not`?"** — "The Node-RED and
  IFTTT targets handle it natively, since they both compile to real
  JavaScript conditions. Home Assistant's template trigger also supports
  it directly through Jinja-style `and`/`or`/`not`."
- **"Can this be extended to more platforms?"** — "Yes — since everything
  reads from one shared parsed structure, adding a new target like openHAB
  or SmartThings is one new function, not a language change."
- **"Does `within 3m` actually check readings over a real 3-minute
  window?"** — Answer honestly here, this is the most likely sharp
  question: "Not in the current interpreter. `within` gets passed through
  to each target's own time-window mechanism where one exists — like Home
  Assistant's `for:` key — so the *generated code* is correct. But the
  local live-tester evaluates one reading at a time, not a rolling window
  across a sequence of readings. Real temporal correlation is a natural
  next step, not something I'm claiming this version already does."
