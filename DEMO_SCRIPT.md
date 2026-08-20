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
the new landing page, not the tool itself. Have a terminal ready in the
background for the CLI part near the end.

---

## [0:00–0:15] Cold open — before you even share your screen

> "Hi, I'm [your name]. This is ShieldQL, my project for Syntax Summit."

## [0:15–1:00] The landing page (screen: the welcome screen, untouched)

*[Screen: the landing page — title, tagline, 3 steps, green button]*

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
> get wrong.
>
> ShieldQL fixes that. You write the alarm once, in plain words, and it
> automatically produces all three versions for you. That's the whole
> idea — one rule in, three real security languages out.
>
> This page already shows the three steps you're about to watch — write,
> translate, test. Let's click in."

*[Action: click "Open the playground →"]*

## [1:00–1:30] First look at the real interface

*[Screen: the tool, header visible]*

> "Okay, now we're inside the actual tool. Up top: the project name, a
> dropdown to load different example alarms, and a help button if anyone
> watching this wants a guide without me talking. There's also a banner
> right under it reminding first-time visitors this is a real, live tool —
> not screenshots. Let's ignore that and go straight to panel one."

## [1:30–2:15] Panel 1 — writing the rule

*[Screen: point at the left panel, labeled "1. Write the rule"]*

> "This left box is where you write one alarm — we call it a **rule**.
> This example is called Credential Stuffing — that's a real attack where
> someone steals a big list of passwords and tries them all against
> different accounts, hoping one works.
>
> Reading it out loud, in plain English: 'when someone logs in, AND they
> got the password wrong 5 or more times, AND they're suddenly logging in
> from a different country than usual — flag it as high severity.'
>
> That's it. No special training needed to read that. And right below it
> — [point] — this green checkmark line tells me instantly that what I
> wrote is valid, with no typos."

## [2:15–3:00] Panel 2 — the three translations

*[Screen: point at the right panel, labeled "2. See it translated"]*

> "This right box takes that ONE rule I just read, and shows it rewritten
> into three real security languages. Watch me click through them."

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

## [3:00–4:00] Panel 3 — the live proof (the big moment)

*[Screen: scroll down to "3. Prove it actually works"]*

> "This bottom box is my favorite part. It's running this exact rule,
> right now, against 7 made-up example security events — logins, file
> transfers, that kind of thing — and showing which ones it would catch.
> Right now it's correctly flagging the credential-stuffing pattern and
> correctly ignoring the six innocent ones.
>
> Now watch — I'm going to edit the rule live."

*[Action: click into the rule editor, change `>= 5` to `>= 2`]*

> "I just changed the rule to flag anyone with 2 or more wrong passwords
> instead of 5. Watch the list below — [point] — it instantly re-checked
> all 7 events again, with no save button, no reload, nothing. That proves
> this is a real, working program thinking through my rule as I type it —
> not a video or a mockup."

## [4:00–4:30] It's not just a website

*[Screen: switch to terminal]*

> "One more thing — this isn't only a webpage. There's also a
> command-line version, so a security team could run this as part of
> their normal automated tools."

*[Action: run `node cli.js compile examples/impossible-travel.shieldql --target=sigma`]*

> "Same program, same correct output, straight from the terminal."

## [4:30–5:00] Why it matters, and close

> "Real security teams almost never use just one tool — and today they
> maintain the same alarm logic separately for each one, which drifts out
> of sync over time. ShieldQL means you write your security knowledge
> once, and trust it everywhere it needs to go. That's ShieldQL — thanks
> for watching."

---

## Cheat-sheet: what to actually click, in order

1. Land on the welcome screen → talk over it → click **"Open the
   playground →"**
2. Point at the header (dropdown + help button) — don't click yet
3. Point at panel 1 (the rule) — read it out loud
4. Click **Splunk SPL** tab → **Sigma YAML** tab → **Elastic EQL** tab, in
   that order
5. Scroll down to panel 3 → point at the match count and rows
6. Click into the editor → change `>= 5` to `>= 2` → point at panel 3
   updating live
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
