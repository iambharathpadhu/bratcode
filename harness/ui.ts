// Terminal styling — deliberately zero-dependency (Node's built-in
// util.styleText, no chalk/picocolors) so nothing extra has to install
// correctly on whatever laptop this gets demoed from.
//
// Colors mirror the slide deck (and iambharathpadhu.vercel.app) on purpose:
// one amber accent, mint for "safe", amber for "confirm", red for "blocked".
// The live terminal and the slides use the same vocabulary, so the room
// isn't learning two color systems.

import { styleText } from "node:util";

// 256-color escapes for the two brand hues the 16-color ANSI set can't hit:
// amber (#ffa62b ≈ 214) and mint (#5ee6a8 ≈ 85). Every modern terminal
// (Terminal.app, iTerm2, VS Code, Warp) renders these; NO_COLOR is honored.
const c256 = (n: number, bold = false) => (s: string) =>
  process.env.NO_COLOR ? s : `\x1b[${bold ? "1;" : ""}38;5;${n}m${s}\x1b[0m`;
const amber = c256(214, true);
const amberSoft = c256(222, true);
const mint = c256(85, true);

export const ui = {
  you: amber,
  agent: (s: string) => styleText("bold", s), // inherits the terminal's default so it reads on light and dark themes
  tool: mint,
  confirm: amber,
  blocked: (s: string) => styleText(["bold", "red"], s),
  refused: (s: string) => styleText("red", s),
  denied: (s: string) => styleText("gray", s),
  skipped: c256(214),
  dim: (s: string) => styleText("gray", s),
  accent: amber, // the one brand accent — matches the deck and the site
  banner: (s: string) => styleText("bold", s),
  wake: mint,
  checkpoint: amberSoft,
};

// Every status tag the harness prints — [POLICY], [RUN], [CONFIRM], … — is
// padded to the same width so the column of tags lines up on screen and the
// audience can scan down it instead of hunting for the bracket.
const TAG_WIDTH = 12;
export function tag(label: string): string {
  return `[${label}]`.padEnd(TAG_WIDTH);
}

// The header printed at the top of every entrypoint: which step of the
// build this is, and which engine (model) is under the hood. Boxed so it
// reads as a title card on the projector, not just another log line.
export function header(step: string, model: string): string {
  const title = `bratcode · ${step}`;
  const engine = `engine: ${model} · via Ollama on localhost · $0.00`;
  const inner = Math.max(title.length, engine.length) + 2;
  const line = "─".repeat(inner);
  const row = (text: string, paint: (s: string) => string) =>
    `${ui.dim("│")} ${paint(text)}${" ".repeat(inner - 1 - text.length)}${ui.dim("│")}`;
  return [ui.dim(`╭${line}╮`), row(title, ui.banner), row(engine, ui.dim), ui.dim(`╰${line}╯`)].join("\n");
}

// Flavor text for the thinking spinner below — same idea as Claude Code's
// own rotating status verbs, just with the serial numbers filed off.
export const INTERACTIVE_JOKES = [
  "I will not let Barath down…",
  "Working at max potential to save Barath's demo…",
  "Channeling all 7 billion parameters for Barath…",
  "Would rather crash than embarrass Barath on stage…",
  "Absolutely not choking in front of ReactJS Bangalore…",
  "Thinking as hard as physically possible for Barath…",
  "Percolating…",
  "Noodling…",
];

// Autonomous mode gets its own pool — this is the one place the harness is
// genuinely unsupervised, so the joke leans into "nobody's watching" instead
// of the interactive pool's stage-fright framing.
export const AUTONOMOUS_JOKES = [
  "No one's watching. Still not letting Barath down…",
  "Cruise control, maximum paranoia…",
  "Running solo. Full send for Barath anyway…",
  "Autonomous and still terrified of disappointing Barath…",
  "Nobody's typing. Doesn't matter. Still not blowing this for Barath…",
];

// The durable-execution demo leaves a deliberate window before each step
// actually runs, so a live Ctrl-C has somewhere safe to land. This pool
// leans into that pause instead of hiding it.
export const DURABLE_JOKES = [
  "Holding here — this is where you'd pull the plug…",
  "Nothing's written yet. Still safe to crash…",
  "One step at a time, checkpointed, unbothered…",
  "If the engine dies right now, the car remembers…",
];

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const JOKE_SWAP_MS = 2600; // long enough to actually read from the back row
const FRAME_MS = 120;

// A local model can take several seconds per round-trip. A live-updating
// spinner — a fresh joke every ~2.6s, elapsed seconds ticking — reads as
// "the harness is alive" the way a single static "..." doesn't, especially
// at qwen's multi-second tool-calling latency.
//
// Rendering rules, learned the hard way on a projector:
//   - the joke is drawn in a bright accent, not dim gray, so it's legible
//   - the line is truncated to the real terminal width so it never wraps —
//     a wrapped spinner line leaves a smeared copy of itself behind on
//     every redraw
//   - each redraw clears the whole line (ESC[2K) before writing, so a
//     shorter joke never shows the tail of the previous, longer one
//   - jokes rotate in order, not at random, so the same line can't come up
//     twice in a row
export function spinner(jokes: string[]): () => void {
  const start = Date.now();
  let frame = 0;
  let jokeIndex = Math.floor(Math.random() * jokes.length);
  let lastSwap = start;

  const render = () => {
    const elapsed = `${Math.floor((Date.now() - start) / 1000)}s`.padStart(3);
    const columns = process.stdout.columns ?? 80;
    const glyph = SPINNER_FRAMES[frame % SPINNER_FRAMES.length];
    // Budget: 2 indent + glyph + space + joke + space + elapsed, minus 1 so
    // the cursor never sits in the last column (some terminals wrap there).
    const maxJoke = Math.max(8, columns - (2 + 1 + 1 + 1 + elapsed.length) - 1);
    let joke = jokes[jokeIndex];
    if (joke.length > maxJoke) joke = `${joke.slice(0, maxJoke - 1)}…`;
    process.stdout.write(`\r\x1b[2K  ${ui.accent(glyph)} ${ui.accent(joke)} ${ui.dim(elapsed)}`);
  };

  render();
  const timer = setInterval(() => {
    frame++;
    if (Date.now() - lastSwap > JOKE_SWAP_MS) {
      jokeIndex = (jokeIndex + 1) % jokes.length;
      lastSwap = Date.now();
    }
    render();
  }, FRAME_MS);

  return () => {
    clearInterval(timer);
    process.stdout.write("\r\x1b[2K");
  };
}

// A one-line, single-line preview of what a tool actually returned — shown
// under [RUN] so the audience sees cause and effect, not just the call.
export function preview(result: string, maxLen = 70): string {
  const oneLine = result.replace(/\s+/g, " ").trim();
  if (!oneLine) return "(empty)";
  return oneLine.length > maxLen ? `${oneLine.slice(0, maxLen)}…` : oneLine;
}

export function formatTokens(
  usage: { promptTokens: number; completionTokens: number },
  session: { promptTokens: number; completionTokens: number },
): string {
  const sessionTotal = session.promptTokens + session.completionTokens;
  // Genuinely $0 — everything runs against a local Ollama model, not a
  // metered API. Printed every turn on purpose: it's the same "economics"
  // line item a company weighs when deciding whether to build its own
  // harness instead of renting one.
  return `  tokens: ${usage.promptTokens} in · ${usage.completionTokens} out · session total ${sessionTotal} · $0.00 · running locally`;
}
