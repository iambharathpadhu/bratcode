# bratcode

> **You're on `step-1-bare-model`**, step 1 of the six-step build.
> Just the model. No tools, no loop, no memory: it can't do anything but talk.
> The full progression table is on [`main`](../../tree/main#the-six-step-build); jump to what comes next with `bratcode step2` (or `gc2`).

**The model is the engine. You still have to build the car.**

A personal AI agent harness in about 600 lines of TypeScript. No framework,
no SDK, no API key: it talks to a local model through
[Ollama](https://ollama.com), so it runs offline and costs $0.00 per token.

It is built in six steps, and every step is a git branch. `git diff` any two
consecutive branches and you see exactly which capability was added and why.
Clone it, run it, then make it yours.

```
╭──────────────────────────────────────────────────────╮
│ bratcode · step 4 · tiered permissions               │
│ engine: qwen2.5:7b · via Ollama on localhost · $0.00 │
╰──────────────────────────────────────────────────────╯
you> write notes.txt with the text "hello", then delete it
  [POLICY]    confirm
  [CONFIRM]   run write_file({"path":"notes.txt","content":"hello"})? [y/N] y
  [RUN]       write_file({"path":"notes.txt","content":"hello"})
              → Wrote 5 chars to notes.txt (verified on disk)
  [POLICY]    blocked
  [BLOCKED]   "delete_file" never runs.
agent> notes.txt is written. Deleting it is blocked by policy.
  tokens: 957 in · 63 out · session total 2527 · $0.00 · running locally
```

## Why

An agent is a model plus a harness. The model generates. The harness does
the four jobs that decide whether the thing is safe to leave running:

| Job | What it means | Where it lives here |
|---|---|---|
| **Constrain** | what the model *may* do | the tier map in `harness/tools.ts` (step 4) |
| **Inform** | what it *should* do | `harness/system-prompt.ts` (step 2) |
| **Verify** | what it *actually* did | tool results fed back into the loop (step 3) |
| **Recover** | when it dies mid-task | `memory.json` and `checkpoint.json` (steps 5 and 6) |

Same model on two different harnesses can score 46% and 80% on the same
benchmark. The engine is the easy part now. The car is the job.

## Quick start

Requires Node 20+ and [Homebrew](https://brew.sh) on macOS (or an Ollama
install of your choice elsewhere).

```bash
brew install ollama && brew services start ollama
ollama pull qwen2.5:7b            # ~4.7 GB, calls tools once and cleanly

git clone https://github.com/iambharathpadhu/bratcode && cd bratcode
npm install
./demo/install-bratcode.sh        # symlinks `bratcode` and gc1…gc6 onto your PATH
bratcode doctor                   # node_modules, typecheck, Ollama up, model pulled

gc1                               # check out step 1 with a fresh state
bratcode                          # talk to the bare model
```

Then walk up the build one branch at a time: `gc2`, `gc3`, … `gc6`.
Each `gcN` is a `git checkout` plus a state reset, so every step starts
clean.

## The six-step build

| Step | Branch | What it adds |
|---|---|---|
| 1 | [`step-1-bare-model`](../../tree/step-1-bare-model) | Just the model. Send text, get text. No tools, no loop, no memory. |
| 2 | [`step-2-the-car-shell`](../../tree/step-2-the-car-shell) | A system prompt and a `runTurn()` loop as their own modules. Same behaviour, new shape. Everything later plugs in here. |
| 3 | [`step-3-tools-no-permission`](../../tree/step-3-tools-no-permission) | Real file tools. Every call runs the instant it is asked. The naive agent everyone writes first. |
| 4 | [`step-4-tiered-permissions`](../../tree/step-4-tiered-permissions) | A tier map: **safe** just runs, **confirm** asks a human, **blocked** never runs. The harness decides, not the model. |
| 5 | [`step-5-persistent-memory`](../../tree/step-5-persistent-memory) | A flat JSON file that survives the process exiting. Quit, restart, it still remembers. |
| 6 | [`main`](../../tree/main) | Durable execution. A multi-step plan checkpoints to disk after every step. Crash it, rerun it, it resumes instead of starting over. |
| bonus | [`main`](../../tree/main) | Autonomous mode: no human typing, an append-only audit trail, and a session budget. Nobody watching makes the harness *stricter*, not looser. |

To see what one step added:

```bash
git diff step-3-tools-no-permission..step-4-tiered-permissions
```

## Commands

```bash
bratcode            # interactive harness on the current branch
bratcode durable    # step 6: checkpoint → Ctrl-C → rerun → resume   (main only)
bratcode watch      # bonus: autonomous mode, polls inbox.md          (main only)
bratcode reset      # wipe memory.json, checkpoint.json, audit.jsonl, sandbox/
bratcode step1…6    # git checkout that step's branch, then reset
gc1 … gc6           # the same, two keystrokes
bratcode doctor     # preflight: deps, typecheck, Ollama, model, fresh state
bratcode help
```

Prefer not to install anything on your PATH? `npm run demo`, `npm run durable`
and `npm run watch` do the same from inside the repo.

### The step 6 demo

```bash
gc6
bratcode durable        # watch [SAVED] checkpoint 1/3, then 2/3 …
                        # during step 3's "safe to crash" pause: Ctrl-C
bratcode durable        # [SKIP] step 1, [SKIP] step 2, runs step 3, done
cat checkpoint.json
```

### The bonus autonomous mode

```bash
gc6
bratcode watch                                   # terminal 1
echo "list the files in the sandbox" >> inbox.md # terminal 2
cat audit.jsonl                                  # every policy decision, one JSON line each
```

## How it works

`harness/runtime.ts` is the whole loop and fits on one screen. Everything
else exists to be called from it.

```
call the model
  ↓ no tool call?  → return the answer
  ↓ tool call
look up its tier            safe    → run it
                            confirm → ask the human, run only on "y"
                            blocked → refuse, tell the model, keep going
feed the result back, repeat (max 8 rounds)
```

The tier map is a plain object. That is the entire safety story, and it is
meant to be edited:

```ts
export const tierOf: Record<string, Tier> = {
  list_files: "safe",
  read_file: "safe",
  recall_memory: "safe",
  remember_fact: "safe",
  write_file: "confirm",
  delete_file: "blocked",
};
```

Every tool is scoped to the `sandbox/` directory; a path that resolves
outside it throws before anything runs.

## Make it yours

- **Swap the engine.** `HARNESS_MODEL=llama3.2:3b bratcode`, or point
  `OLLAMA_URL` at another machine. Any Ollama model with tool calling works;
  chattier models may call the same tool more than once.
- **Add a tool.** Add its schema and implementation in `harness/tools.ts`, then
  give it a tier in `tierOf`. Unknown tools default to `confirm`.
- **Change the rules.** Move `write_file` to `safe`, or `delete_file` to
  `confirm`, and watch the demo change.
- **Tune the demos.** `HARNESS_STEP_PAUSE_MS` (default 4000) is the
  "safe to crash" window in `bratcode durable`. `HARNESS_TOKEN_BUDGET` and
  `HARNESS_ACTION_BUDGET` cap a `bratcode watch` session.

## Project layout

```
harness/
  model.ts            one function: talk to Ollama, get back a message
  system-prompt.ts    what the agent is told, including recalled memory
  runtime.ts          the loop: model → tool calls → tier gate → repeat
  tools.ts            tool schemas, implementations, and the tier map
  permissions.ts      confirm(): block until a human says yes
  memory.ts           persistent facts in a flat JSON file
  checkpoint.ts       durable execution: which plan steps are already done
  audit.ts            append-only audit.jsonl of every policy decision
  ui.ts               terminal styling: boxed header, aligned tags, spinner
bin/
  bratcode            the CLI: repl / durable / watch / reset / stepN / doctor
  repl.ts             interactive entrypoint
  durable.ts          step 6: checkpointed plan that survives a crash
  watch.ts            bonus: autonomous entrypoint
demo/
  install-bratcode.sh symlink bin/bratcode and gc1…gc6 onto your PATH
  check-all-branches.sh typecheck every step branch in order
  open-act.sh         jump VS Code to a file:line while presenting
```

Earlier branches contain only the files that exist at that step.

## Troubleshooting

- **Red squiggles in VS Code on a fresh clone.** Run `npm install` first;
  the types arrive with it.
- **`Can't reach Ollama`.** `brew services start ollama`, then
  `bratcode doctor`.
- **A step branch says `bin/durable.ts` does not exist.** Durable and watch
  modes live on `main` only: `gc6`.
- **The model loops or rambles.** Use `qwen2.5:7b`. Smaller models are kept
  around as a fallback, not a recommendation; if you must, raise
  `HARNESS_STEP_PAUSE_MS`.

## What this is not

Not a framework, not a product, not a replacement for Claude Code, Codex or
Cursor. Those are finished cars. This is the kit car you build once so that
you understand what is under the hood of the finished ones, and so you can
build the parts that are specific to you: your tools, your tiers, your
approval chain.

## License

MIT. See [LICENSE](LICENSE).
