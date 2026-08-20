# Demo video script — full narration, ~5 minutes

This is written so you can basically read it out loud and it'll make sense
to someone who has never seen this project before. Practice it 2-3 times so
it sounds like you, not like you're reading — but the words are all here so
you don't have to improvise definitions on the spot.

Every unfamiliar term is defined **the moment it's said**, not before or
after — so you never have to assume the viewer already knows what Splunk,
Sigma, or a "rule" means.

Before recording: open a fresh browser tab at `index.html` (or `node
serve.js` → `http://localhost:5173`) so the very first thing on screen is
the landing page, not the tool itself. Have a terminal ready in the
background for the CLI part near the end.

**Layout note:** the tool has two top-level tabs at the top of the page:
**"✏️ Write & Test"** (the default view — the rule editor and the live test
results, side by side) and **"🔄 See it Translated"** (a second tab showing
the same rule compiled into Splunk/Sigma/Elastic). You start on the first
tab and switch to the second partway through.

---

## [0:00–0:15] Cold open — before you even share your screen

> "Hi, I'm [your name]. This is ShieldQL, my project for Syntax Summit."

## [0:15–1:00] The landing page (screen: the welcome screen, untouched)

*[Screen: the landing page — title, tagline, the "today vs ShieldQL" comparison, green button]*

> "Before I touch any code, let me explain what this actually does, because
> the name won't mean anything yet.
>
> Big security companies — like **Splunk** and **Elastic** — sell tools
> that watch over a company's computers. Every time someone logs in, opens
> a file, or does basically anything, it gets written down, and these
> tools let a security team search through all of that and set up alarms
> for suspicious behavior.
>
> There's also something called **Sigma** — that's not a company or a
> tool, it's just a shared way of *writing down* an alarm idea on paper,
> so people using different tools can trade ideas with each other.
>
> Here's the problem: Splunk, Sigma, and Elastic each want that alarm
> written in a totally different style. So today, a security person writes
> the same alarm three separate times by hand — which is slow, and easy to
> get wrong. That's this picture right here [point at the comparison box]:
> one idea, hand-written three times, that can quietly drift out of sync.
>
> ShieldQL fixes that. You write the alarm once, in plain words, and it
> automatically produces all three versions for you. Let's click in."

*[Action: click "Open the playground →"]*

## [1:00–1:20] First look at the real interface

*[Screen: the tool, "✏️ Write & Test" tab active by default]*

> "Okay, now we're inside the actual tool. Up top: the project name, a
> dropdown to load different example alarms, and a help button if anyone
> watching this wants a guide without me talking. Right under that,
> there's always a one-line description telling you exactly which example
> is loaded and what it catches.
>
> There are two tabs at the top of the page. We're on 'Write & Test' right
> now — that's the rule editor and a live tester, side by side. There's a
> second tab, 'See it Translated,' that I'll switch to later."

## [1:20–2:00] The rule editor

*[Screen: point at the left box, "Write the rule"]*

> "This left box is where you write one alarm — we call it a **rule**.
> This example is called Credential Stuffing — that's a real attack where
> someone steals a big list of passwords and tries them all against
> different accounts, hoping one works.
>
> Reading it out loud, in plain English: 'when someone logs in, AND they
> got the password wrong 5 or more times, AND they're suddenly logging in
> from a different country than usual — flag it as high severity.'
>
> That's it. No special training needed to read that. Notice there are
> even comments right next to each line, in gray, explaining what it does
> and suggesting numbers to try changing. And right below the box — [point]
> — this green checkmark line tells me instantly that what I wrote is
> valid, with no typos."

## [2:00–3:00] The live test panel (the big moment)

*[Screen: point at the right box, "Prove it actually works"]*

> "This right box is my favorite part. It's running this exact rule, right
> now, against 7 made-up example security events — logins, file transfers,
> that kind of thing — and showing which ones it would catch. Right now
> it's correctly flagging the credential-stuffing pattern and correctly
> ignoring the six innocent ones.
>
> Now watch — I'm going to edit the rule live."

*[Action: click into the rule editor, change `>= 5` to `>= 2`]*

> "I just changed the rule to flag anyone with 2 or more wrong passwords
> instead of 5. Watch the list on the right — [point] — it instantly
> re-checked all 7 events again, with no save button, no reload, nothing.
> That proves this is a real, working program thinking through my rule as
> I type it — not a video or a mockup."

## [3:00–3:45] Switching tabs — the three translations

*[Action: click the "🔄 See it Translated" tab at the top of the page]*

> "Now let's switch tabs. This is the same rule I was just editing,
> rewritten into three real security languages. Watch me click through
> them."

*[Action: click "Splunk SPL" tab]*

> "This is **Splunk's** language — remember, Splunk is one of the biggest
> tools security teams use to search their logs. This is exactly what
> you'd paste into Splunk to make this alarm real."

*[Action: click "Sigma YAML" tab]*

> "This is **Sigma** — the shared, open format I mentioned earlier, so
> this same alarm could be published for other security teams to use in
> whatever tool *they* have."

*[Action: click "Elastic EQL" tab]*

> "And this is **Elastic's** language — Elastic is another major company
> that does the same job as Splunk, with its own tool and its own way of
> writing things.
>
> I didn't write any of these three by hand — my program read the one
> plain rule and generated all three. And down here [point at the tip
> line] — where a translation genuinely can't be done perfectly, like
> Sigma not being able to compare two different pieces of information to
> each other, it says so honestly instead of pretending it worked."

## [3:45–4:15] It's not just a website

*[Screen: switch to terminal]*

> "One more thing — this isn't only a webpage. There's also a
> command-line version, so a security team could run this as part of
> their normal automated tools."

*[Action: run `node cli.js compile examples/impossible-travel.shieldql --target=sigma`]*

> "Same program, same correct output, straight from the terminal."

## [4:15–5:00] Why it matters, and close

> "Real security teams almost never use just one tool — and today they
> maintain the same alarm logic separately for each one, which drifts out
> of sync over time. ShieldQL means you write your security knowledge
> once, and trust it everywhere it needs to go. That's ShieldQL — thanks
> for watching."

---

## Cheat-sheet: what to actually click, in order

1. Land on the welcome screen → talk over it → click **"Open the
   playground →"**
2. Point at the header (dropdown + help button) and the example
   description line — don't click yet
3. Point at the left box (the rule) — read it out loud, mention the inline
   comments
4. Point at the right box (test results) → click into the editor → change
   `>= 5` to `>= 2` → point at the results updating live
5. Click the **"🔄 See it Translated"** tab, top of page
6. Click **Splunk SPL** → **Sigma YAML** → **Elastic EQL**, in that order
7. Switch to terminal → run the `node cli.js compile ...` command shown
   above
8. Close on the "why it matters" line — no need to go back on screen

## If you get a question you don't expect

You don't have to know everything — it's fine to say "that's a great
question, let me follow up" — but here are the ones most likely to come
up:

- **"Isn't this just like existing Sigma-to-X converters (e.g.
  Uncoder.io)?"** — "That's fair, rule translation isn't a brand-new idea.
  What's different here is ShieldQL is a purpose-built *authoring*
  language with its own live tester built in — you can prove a rule
  actually catches the right events before you ever export it anywhere,
  which a pure converter can't do since it starts from an already-written
  Sigma rule."
- **"What happens if the rule uses `or` or `not`?"** — "The Elastic
  version handles it natively. The Sigma version currently flags that
  case with a note since Sigma's flat format can't express it cleanly —
  that's a documented, honest limitation, not a bug."
- **"Can this be extended to more tools?"** — "Yes — since everything
  reads from one shared parsed structure, adding a new target like YARA or
  Suricata is one new function, not a language change."
- **"Does `within 10m` actually check events over a real 10-minute
  window?"** — Answer honestly here, this is the most likely sharp
  question: "Not in the current interpreter. `within` gets passed through
  to each target's own time-window syntax — like Splunk's `earliest=`,
  Sigma's `timeframe:`, or Elastic's time range picker — so the *generated
  code* is correct. But the local live-tester evaluates one event at a
  time, not a rolling window across a sequence of events. Real temporal
  correlation is a natural next step, not something I'm claiming this
  version already does."
