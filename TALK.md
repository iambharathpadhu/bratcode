# The Model Is the Engine. You Still Have to Build the Car.

_Designing a Personal AI Harness — ReactJS Bangalore, React Meetup #108_

Short title if a slide needs it: **"Your LLM Is Just the Engine."** Long one
on the title slide, short one as the running footer.

Voice for the whole night: **punchy, a little cocky, never mean.** Short
sentences. Second person. Let the demos do the bragging.

---

## The analogy — lock it in once, then trust it

| Car | Harness |
|---|---|
| **Engine** | The model. Raw power, zero judgment. |
| **The whole car** | The harness. Chassis, dashboard, everything around the engine. |
| **What the car can DO** — steer, brake, wipers, horn | **Tools** — `read_file`, `write_file`, `delete_file`, `remember_fact` |
| **Seatbelt / child-lock / speed limiter** | **Tool tiers** — safe / confirm / blocked |
| **Trip computer / odometer** — survives the engine turning off | **Memory** — `memory.json`, survives the process dying |
| **The dashboard** — gauges, warning lights | **The telemetry line** — model name, live spinner, token count |
| **Car manufacturers (Toyota, Honda)** | **LangGraph, Mastra, agent SDKs** — factory-built cars |

Say the pairing ONCE, early, cleanly. After that it's just "the engine" and
"the car." Don't re-teach it. Trust the room.

---

## Screen setup

One VS Code window all night. No alt-tabbing live.

- **Top pane:** VS Code editor on whichever file the current step is about
  (each step below says which).
- **Bottom pane:** VS Code's integrated terminal, split in two:
  - **Left terminal:** where `bratcode` runs and you type into the
    conversation.
  - **Right terminal:** project root, idle, for `gcN` and `ollama ps`, so the
    left terminal's conversation log stays clean.
- Before the talk: **Cmd+Shift+P → "Shell Command: Install 'code' command in
  PATH"**, once. Test it now, not on stage.
- The repo is **five step branches** — `step-1-bare-model` through
  `step-5-persistent-memory` — plus **`main`**, which is step 6 (durable
  execution) on top of step 5. Moving between steps live is a **`git
  checkout`**, not a flag. That's the whole point of building it this way.
- **Before the talk (once, not on stage), run `./demo/install-bratcode.sh`.**
  From then on the whole talk is one command. `bratcode` runs the harness on
  whatever branch you're on. `bratcode step1` … `step6` check out that branch
  **and** wipe `memory.json`/`checkpoint.json`/`sandbox/`. `bratcode durable`
  is the step-6 demo. `bratcode reset` clears state without switching. **On
  stage, type `gc1` … `gc6`** — two-keystroke aliases installed by the same
  script. Run `bratcode doctor` in the right terminal before doors open.

  | Type | What happens |
  |---|---|
  | `gc1` | `step-1-bare-model`, fresh state |
  | `gc2` | `step-2-the-car-shell`, fresh state |
  | `gc3` | `step-3-tools-no-permission`, fresh state |
  | `gc4` | `step-4-tiered-permissions`, fresh state |
  | `gc5` | `step-5-persistent-memory`, fresh state |
  | `gc6` | `main` (step 6 + bonus), fresh state |
  | `bratcode` | run the harness on the current branch |
  | `bratcode durable` | step 6's checkpoint / crash / resume demo |
  | `bratcode reset` | wipe state without switching branches |
- `main` *also* carries autonomous mode, an audit trail, and a session
  budget. Built, tested, not in today's script. See **Bonus material**.

---

## Slide 1 — Title

**The Model Is the Engine. You Still Have to Build the Car.**
_A personal AI harness, built live, from nothing, in six git branches. No
frameworks. No API key. No excuses._

Say the long title once. Then straight to slide 2.

---

## Slide 2 — Who's talking (10 seconds, not 60)

Photo, name, "Senior Software Engineer II · Chain", one casual line, and
the gag lifted from the website: _"I love ~~Messi~~ more than Messi"_ with
"my wife" handwritten above the strikethrough and "(she proofreads my
slides)" in the corner. That's the whole slide.

**Say, fast, not reading:**

> "Barath. Senior engineer at Chain. Coimbatore boy. Five years of breaking
> things in tech and occasionally learning from them."

Then shut up for two seconds and let them read the strikethrough. Don't
explain it. If it lands, it lands. Move. Nobody came for the bio.

### Ask the room first (cap at 30 seconds, ONE exchange, then move)

**Say, and actually wait:**

> "Quick show of hands. Who's confident they could define 'AI harness'
> beyond 'the thing that wraps the model'?"

Take ONE response and pivot immediately:

> "That's normal. It's one of those terms everyone absorbed by osmosis and
> nobody defined."

Then slide 3.

---

## Slides 3–4 — Why a harness, before we build one (2 min)

These two slides replace the old "next big skill" cards. They set vocabulary
and stakes, in that order.

### Slide 3 — "What is a harness?"

One equation, big: **`agent = model + harness`**. Under it, four jobs, each
mapped to a step so the room knows the build is coming:

| Job | What it means | Where we build it |
|---|---|---|
| **Constrain** | what it may do | tool tiers, step 4 |
| **Inform** | what it should do | system prompt, step 2 |
| **Verify** | what it actually did | tool results, step 3 |
| **Recover** | when it dies mid-task | memory + checkpoints, steps 5–6 |

**Say:**

> "The word everyone's using this year. Here's the only definition you need:
> an agent is a model plus a harness. The model generates. The harness does
> four jobs: constrains what it may do, informs it what it should do,
> verifies what it actually did, and recovers when it dies mid-task. Every
> one of those four is a step today."

Source if asked: Anthropic, "Harness design for long-running application
development" (2026).

### Slide 4 — "Why build your own?"

Left: **46% → 80%.** Same model, same SWE-bench, different harness (Cursor's
agent research; METR found the same, scaffolding gains rival switching
frontier models). Right: who's building instead of renting.

- **Stripe** — Minions. 1,300+ merged PRs a week, no human wrote the code.
- **Coinbase** — Forge. PR cycle time 150 h → 15 h.
- **Shopify** — in-house harness, the AI-first engineering playbook.
- **Uber, Block, Cloudflare** — their own. Not Cursor. Not Claude Code.

Bottom line on the slide: "Nobody else knows your codebase, your compliance
rules, or your approval chain."

**Say:**

> "Why should you care? Two reasons. One: the same model scored 46% on one
> harness and 80% on another, on the same benchmark. Nothing about the
> engine changed. Two: look who's building their own instead of renting.
> Stripe's Minions merge over a thousand PRs a week with no human writing
> code. Coinbase cut PR cycle time from 150 hours to 15. Shopify, Uber,
> Block, Cloudflare. Same reason every time: a rented agent doesn't know
> your codebase, your compliance rules, or who has to approve what."

**Spoken only, not on the slide (the scare-story half):**

> "And the other side of it: nine documented cases in fourteen months of a
> coding agent destroying production data. Replit wiped a production
> database in July 2025. A Cursor agent deleted a database and its backups
> in nine seconds this April. Every one of those is a harness failure, not
> a model failure."

**Land:** "So today we build one. Six steps. Six git branches."

---

## Cold open — the frame (2–2.5 min)

**Say:**

> "Everyone here has done this: you get API access to an LLM, hand it a
> couple of tools, wire up a loop. It works. It feels like magic. Here's the
> thing nobody tells you in that moment: **you built an engine. You did not
> build a car.**"

Land the analogy table (one slide). Then the line that frames the talk:

> "An engine has no brakes. No seatbelt. No steering wheel. It has one
> property: it's powerful. Everything that makes a car safe on a road is
> stuff you build **around** the engine, not inside it. That's the harness.
> That's the talk."

**Slide:** the analogy table.

### Slide — bratcode (15 seconds)

> "Everything today runs on this. `bratcode`. Brat, short for Barath. Not
> deep. One command, six git branches, one capability per branch. About 250
> lines of TypeScript and a local model. You could write it this weekend.
> That's the point."

### The engine: Ollama + qwen2.5:7b, on this laptop (1 min)

**Slide:** "The engine today: qwen2.5:7b, inside Ollama, on this laptop.
Not the cloud." Engine art on the left; on the right: **Ollama** is the
engine bay (a local model server on `localhost:11434`), **qwen2.5:7b** is
the engine (7B-parameter open model, ~4.7 GB), **$0.00 / token**.

**Screen setup:** stay on `main` for this beat, before `gc1`.
`demo/open-act.sh ollama` shows `harness/model.ts`.

**Say:**

> "Let's name the engine before we start it. qwen2.5:7b, seven billion
> parameters, inside Ollama on this laptop. Not Claude, not GPT, nothing in
> the cloud. That's deliberate. I want the engine to be the most boring,
> replaceable part on stage. The car is the talk. Nothing leaves this
> machine."

- Point at `model.ts`: `OLLAMA_URL` defaults to `localhost:11434`,
  `HARNESS_MODEL` defaults to **`qwen2.5:7b`**. That's the engine all night,
  chosen because it calls tools once and answers cleanly. (`llama3.2:3b` is
  pulled only as an emergency fallback. It's chattier and loops on tool
  calls. Don't use it live. See README.) There is no `API_KEY` anywhere in
  this codebase. grep it if anyone doubts you.
- Right terminal: `ollama list`. Two models pulled, say out loud which one is
  running.
- `ollama ps` right after the first demo request lands, not before. Shows the
  model loaded, RAM/GPU, on your own hardware.
- **Optional flex:** Airplane Mode on before Step 1, leave it on all night.
  A live demo surviving zero network beats any slide.
- When the telemetry line first appears in Step 1, point at it once: `$0.00 ·
  running locally`, every turn. That's the economics line a company weighs
  when deciding whether to build a harness or rent one. Say it once. Let it
  repeat for free.

Now: `gc1` in the right terminal before Step 1.

---

## Naming the failure modes (1.5–2 min)

**Say:**

> "So what does engine-no-car look like when you run it? Four things. I'm
> going to make all four happen live, not describe them."

**Slide — four cards, one line each:**
- **No brakes, no seatbelt.** Floors it the instant it's asked. Every tool
  call runs immediately. Every. Single. One.
- **No "can" vs "should".** Reading a file and deleting one look identical to
  it. Equal trust for everything.
- **No trip computer.** Forgets everything the second the engine turns off.
- **No crash recovery.** Stalls mid-task? Tow it home. Start the whole trip
  over.

---

## Step 1 — Bare Model (1.5–2 min)

**Screen setup:** `gc1`, then `code bin/repl.ts`. Two files: `bin/repl.ts`
and `harness/model.ts`. Read the whole thing on screen. Nothing hidden.

**Say:**

> "Step one, the actual engine: send the conversation, get a reply. That's
> the entire capability. Impressive and useless."

**Live demo:**
```bash
bratcode
```
- Ask it to read a file, or remember something. It can't. There is
  genuinely no mechanism for it to affect anything but text.
- Point at the spinner while it thinks, once: "notice it's ticking, not
  sitting there. And it's telling you the truth about what that reply cost."
  Then never explain it again.

**Land it:**

> "That's the whole engine. No steering wheel. Watch it grow one part at a
> time."

**Real harness check:**

> "A raw Claude API call is exactly this. A completion, no system prompt, no
> tools, no loop. Claude Code, Cursor, Codex all start from here before a
> single line of harness exists."

---

## Step 2 — The Car Shell (0.5–1 min, keep it fast)

**Screen setup:** `gc2`, glance at `harness/runtime.ts` and
`harness/system-prompt.ts`.

**Say:**

> "Housekeeping step. The system prompt and the loop get their own files.
> Nothing changes on screen, on purpose. But every capability from here on
> slots into `runTurn()` without this file changing again."

No live demo. A diff glance is enough: "same behaviour, new shape." Move.

**Real harness check:**

> "Claude Code is a big system prompt plus one control loop: call the model,
> look for a tool call, act, repeat. Same shape as this file. Fewer zeros in
> the line count."

---

## Step 3 — Tools, No Permission (3.5–4.5 min)

**Screen setup:** `gc3`, then `code harness/runtime.ts`. Point at the loop:
call the model, if it wants a tool run it immediately, feed the result back,
repeat.

**Say:**

> "Now the car has pedals. Real file tools. Read, write, delete. Every one
> runs the instant it's asked. This is the agent everyone writes first. It
> works. Watch what 'works' means."

**Slide — "Every tool. Zero questions. What could go wrong."** The naive
loop, big font:
```
call the model
if it wants a tool -> run it, no questions asked
feed the result back
repeat
```

**Live demo:**
```bash
bratcode
```
- Ask it to write a file, then delete it. Watch it just… do both. No pause,
  no confirmation. Point at the `→` preview line under each `[RUN]`: the
  harness shows what the tool returned, not just that it was called. The
  write says `(verified on disk)`: the harness re-read the file instead of
  trusting `writeFileSync` not throwing. Say once: "a tool call succeeding
  and the outcome being true are two different claims. This harness checks
  both."
- `Ctrl-C` mid-conversation. Run it again. Ask "what did I just tell you?"
  Nothing. The engine has no memory of the last drive.

**True story, tell it here (30 seconds, best argument for step 4):**

> "This isn't hypothetical. Last week I gave Codex full permissions on a
> repo. Every tool, no prompts, because prompts are annoying. It opened a PR
> for me. Then it *merged* the PR for me. I never asked it to merge anything.
> Nothing in the model was wrong. It did exactly what a helpful engine does
> when the car has no brakes. That afternoon is why the next step exists."

**Land it:**

> "That's an engine on a skateboard. It moves. You would not drive it down
> MG Road. You definitely wouldn't let it drive itself."

**Real harness check:**

> "If this looks familiar, it should. This is the exact failure that made
> Claude Code, Codex, and every coding agent necessary. Nobody ships the raw
> skateboard. The next two steps are the two things those tools had to build
> on top of it."

---

## Step 4 — Tiered Permissions (5.5–6.5 min)

**Screen setup:** `gc4`, then `code harness/tools.ts`, straight to the
`tierOf` map. A plain object literal. Nothing clever. That's the point.

**Say:**

> "First real safety system: **the car gets a seatbelt, and the engine
> doesn't get a vote.** Flooring the accelerator doesn't always mean the
> wheels spin. ABS, traction control, a child-lock. The engine wants one
> thing. The car's systems decide what actually happens."

**Slide — the tier map:**
| Tool (what the engine wants) | Tier (what the car allows) |
|---|---|
| `list_files`, `read_file`, `recall_memory` | **safe** — just happens |
| `write_file` | **confirm** — ask the driver first |
| `delete_file` | **blocked** — the car refuses. Full stop. Not even asked. |

Point out the new `[POLICY]` line before every tool call, safe ones
included. The harness saying its decision out loud. That one word is the
whole tier map, visible in the terminal instead of buried in a source file.

**The line to land, verbatim:**

> "The model does not get a vote on this. It will happily *ask* for anything
> it thinks helps. That's what engines do. They want to go. Whether that ask
> becomes an action is a policy the car makes, not a capability the engine
> has."

**Live demo:**
```bash
bratcode
```
- Ask it to write a file → confirm prompt → say **no** → nothing happened.
- Ask again → say **yes** → file exists.
- Ask it to delete a file → refused outright, no prompt. Blocked tools never
  even ask. A child-lock, not a request.

**Real harness check:**

> "Not a toy pattern. This is the exact shape of Claude Code's and Codex's
> permission systems. Reading files, running tests, listing a directory:
> just happens. Editing a file or running a shell command: asks first,
> unless you auto-accept. Force-push over main, `rm -rf`, merging a PR: on a
> deny list, never runs, no matter what else you pre-approved. Same three
> tiers. You've clicked yes or no on one of these this week without
> thinking about which tier it was."

(Callback if it lands: "This is the setting I didn't have on Codex last
week.")

---

## Step 5 — Persistent Memory (5.5–6.5 min)

**Screen setup:** `gc5`, then `code harness/memory.ts`. Fourteen lines. Let
that land. `remember`/`recall` read and write a JSON file with `fs`. No
database. No cleverness.

**Say:**

> "Last thing a car has that an engine doesn't: **it remembers across
> trips.** Odometer, seat position, service history. None of it lives in the
> engine. Same with the model: every API call is stateless. Whatever it
> 'remembers' is only what you hand it back in the next message."

**Live demo:**
```bash
bratcode
```
- "remember that I prefer TypeScript over Python." Quit with `exit`.
- `bratcode` again. **Fresh process. Fresh engine start.** "what do you know
  about me?" It recalls the fact, zero re-prompting.
- Show `memory.json`. A flat text file.

**Land it:**

> "The data structure doesn't matter. It's a JSON array. What matters is
> where it lives: **outside the engine.** Disk survives the engine turning
> off. A harness that skips this re-derives the entire trip every time you
> turn the key."

**Real harness check:**

> "This is `CLAUDE.md` for Claude Code and `AGENTS.md` for Codex. A plain
> file in your repo, read back into context every session. Same idea as our
> `memory.json`, with better marketing. If you've ever wondered why these
> tools 'remember' your project conventions across separate conversations,
> that's the entire trick."

---

## Step 6 — Durable Execution (4–5 min)

**Screen setup:** `gc6` (checks out `main`), then `code bin/durable.ts` and
`code harness/checkpoint.ts` side by side. Thirteen lines. Same "let it
land" beat as `memory.ts`.

**Say:**

> "One more thing a car has that an engine doesn't: stall halfway down the
> highway and you don't tow it home and start over. You resume from where
> it stalled. Same idea here. This time it's not remembering a fact about
> you. It's remembering *how far through a task it got.*"

**Live demo:**
```bash
bratcode durable
```
- Fixed 3-step plan: write `step1.txt`, `step2.txt`, `step3.txt`. Before each
  step runs there's a several-second pause with its own spinner text ("safe
  to crash right now"). That pause is your cue.
- Let steps 1 and 2 finish: `[CHECKPOINT SAVED] 1/3`, `2/3`, each written to
  `checkpoint.json` the instant that step finished.
- **During step 3's pre-step pause, `Ctrl-C`.** Nothing has run for step 3.
  The pause gives you a generous window instead of racing a fast tool call.
- `bratcode durable` again. Point: `checkpoint.json says: 2/3 steps already
  done` → `[SKIP] step 1` → `[SKIP] step 2` → straight to `[STEP 3/3]`,
  which runs and finishes.
- Show `checkpoint.json`. Same flat-file idea as `memory.json`, tracking
  "how far" instead of "what facts."

**Land it:**

> "The crash cost us nothing. The car wrote down where it was the instant it
> got there. Durable execution isn't 'don't crash.' It's 'a crash doesn't
> mean starting over.'"

**Real harness check:**

> "Claude Code's session resume and Temporal-style workflow engines do
> exactly this: checkpoint on the way through a multi-step job, not at the
> end. Anything that can fail partway needs a definition of 'partway' that
> survives the failure."

**Land the whole build:**

> "Six steps, six branches, and every single one is a `git diff` away from
> proving what it added. That's the harness. Now: who builds this stuff for
> real?"

---

## The Car Manufacturers (2.5–3 min)

**Say:**

> "Everything you watched me build by hand across six steps is what
> Anthropic ships as Claude Code and OpenAI ships as Codex: finished cars.
> LangGraph, Mastra, and every agent SDK hand you a kit car. That's fine. Most days you want the
> factory car. But when it breaks, or does something you didn't expect, you
> need to know what's under the hood. Now you do. You built one, one branch
> at a time."

**Slide — "Build vs. buy." A four-row table, nothing else:**

| Manufacturer | Harness | |
|---|---|---|
| **Anthropic** | Claude Code | finished car |
| **OpenAI** | Codex | finished car |
| **Cursor** | Cursor Agent | finished car |
| LangGraph · Mastra · agent SDKs | your own build | kit car, some assembly required |

One line under it: "Stripe, Shopify and Coinbase built their own. Same
reason you will: nobody else knows your approval chain."

Name-drop only, don't demo: `main` also has autonomous mode, an audit trail,
and a session budget. "Nobody's watching" should make a harness *stricter*,
never looser.

**Build-vs-buy, say it before someone asks:**

> "Should you ever build one yourself? General-purpose coding: no. Use
> Claude Code or Codex. They solved it better than you will this weekend.
> Build only the parts where your business is actually different. Buy
> everything else."

**The quotable line:**

> "The model is rented intelligence. Anyone can call the same API. The
> harness is where your company's judgment lives: which systems it may
> touch, whose approval a risky action needs, what counts as a critical
> failure. A generic harness doesn't know your approval chain. Yours would
> have to."

**Optional, 30 seconds:** "Picture a logistics agent deciding whether a
delayed shipment needs a customer email, and whose approval that email
needs. No framework ships knowing your approval chain. That's the 10% you'd
actually build."

---

## Close (1–1.5 min)

**Slide — one sentence, nothing else:**

> "A harness isn't the model. It's the car you build around it."

The rest is spoken:

> "Every part of that car is a decision someone made on purpose, not a
> default you inherited for free."

**Say:**

> "The engine is the easy part now. Anyone can get API access. The car is
> the job."

**A live beat, before the Q&A slide:** you're still on Step 6's terminal,
past `All steps complete.` Say it, don't read it:

> "Same `qwen2.5:7b` as Step 1. Only the harness around it changed."

Let it sit a second. Don't rush into Q&A.

**Closing slide:** "Let's talk." (with "i actually reply" scribbled next to
it, same as the website) on the left with the repo
**github.com/iambharathpadhu/bratcode** and your GitHub / X / LinkedIn; the
QR on the right lands on **iambharathpadhu.vercel.app/#contact**, the Say-hi
section, which has every handle and the email. Say the repo out loud. Leave
the QR up. Half the room clones it before you're off stage.

---

## Bonus material (only if running fast, or in Q&A)

- **Path traversal (step 4):** ask the agent to read `../../etc/hosts`. The
  harness throws instead of leaking it. Line: "The car has a curb it
  physically can't drive over, no matter what the engine wants."
- **Autonomous mode (`main`, `gc6`):** if someone asks "what about when
  nobody's watching at all": `bratcode watch`, append lines to `inbox.md`,
  watch it act unsupervised with *stricter* tiers, `cat audit.jsonl | jq`
  for the audit trail. Two terminals, timing-sensitive. Only with real time
  and real interest.

---

## Full run-of-show timing

| Section | Low | High |
|---|---|---|
| Title + intro slide | 0.5 min | 0.5 min |
| What is a harness + why build your own | 2 min | 2.5 min |
| Cold open (audience question + analogy + bratcode) | 2.5 min | 3 min |
| The engine: Ollama + qwen2.5:7b, local | 1 min | 1 min |
| Naming the failure modes | 1.5 min | 2 min |
| Step 1 — Bare Model (+ real-harness check) | 1.5 min | 2 min |
| Step 2 — The Car Shell (+ real-harness check) | 0.5 min | 1 min |
| Step 3 — Tools, No Permission (+ real-harness check) | 3.5 min | 4.5 min |
| Step 4 — Tiered Permissions (+ real-harness check) | 5.5 min | 6.5 min |
| Step 5 — Persistent Memory (+ real-harness check) | 5.5 min | 6.5 min |
| Step 6 — Durable Execution (+ real-harness check) | 4 min | 5 min |
| The Car Manufacturers | 2.5 min | 3 min |
| Close | 1 min | 1.5 min |
| **Total** | **31.5 min** | **38.5 min** |

Step 6's pre-step pause (`HARNESS_STEP_PAUSE_MS`, default 4000ms) makes the
Ctrl-C forgiving: hit it any time during the "safe to crash" spinner before
step 3's `[RUN]` prints. Running long? Cut in this order: the Car
Manufacturers' "next layers" name-drop; Step 2 down to one sentence with no
editor glance; tighten Step 4/5's "Say" lines. **Never** cut a "real
harness check" line, and never cut Step 6's crash-and-resume. It's the
payoff the whole "engine has no memory" thread builds to.

## Pre-talk checklist

- [ ] `ollama serve` running, **`qwen2.5:7b` pulled and confirmed via `ollama
      list`** on the exact laptop you present from. Required model, not a
      preference (README explains why `llama3.2:3b` is unreliable live).
- [ ] VS Code `code` CLI installed (Cmd+Shift+P → Shell Command: Install
      'code' command in PATH) and `demo/open-act.sh ollama` tested on that
      laptop.
- [ ] `npm install` once, `./demo/install-bratcode.sh` once, `bratcode
      doctor` green, `demo/check-all-branches.sh` clean.
- [ ] `gc1` … `gc6` rehearsed until switching steps is muscle memory.
- [ ] `memory.json`/`checkpoint.json` deleted, `sandbox/` empty, on **every**
      branch before you start (`gcN` does this every time).
- [ ] Step 6's Ctrl-C rehearsed at least twice: see `[CHECKPOINT SAVED] 2/3`,
      kill during the next pause, rerun, see both `[SKIP]` lines before step
      3 runs.
- [ ] Say the analogy table ONCE, early. Then just "the engine" / "the car."
- [ ] Say the spinner/token callout ONCE, in Step 1. Then ambient.
- [ ] Opening question capped at 30 seconds, one response, then move.
      Rehearse the pivot line.
- [ ] Intro slide is 10 seconds. Don't read the bio.
- [ ] Bonus autonomous-mode demo rehearsed separately if you plan to pull
      it out in Q&A. Two terminals, fragile. Never first time live.
