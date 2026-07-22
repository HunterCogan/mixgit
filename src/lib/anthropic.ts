/**
 * System-level tone instructions injected into prompts.
 */
export const TONE = `Lead with genuine praise. Make every suggestion concrete and tied to a real block the student can add or change. If there are no clear logic issues, do not fabricate one.`;

/**
 * Explains how Scratch projects are rendered as pseudocode in AI prompts.
 */
export const PSEUDOCODE_LEGEND = `- The project is split into targets (the Stage and each sprite): \`Target: <name>\`.
- A target may list \`Global variables:\` (Stage) or \`Local variables:\` as \`[name=value, ...]\`, \`Global lists:\`/\`Local lists:\` as \`[name=[items], ...]\` (long lists are truncated with a \`... (N items)\` marker), and \`Costumes: [...]\`.
- Each script starts with a hat block whose line ends in a \`:\`. Blocks below it are indented one tab per nesting level.
- A block is written \`opcode(FIELD=value, INPUT=value)\`. A trailing \`:\` means the block wraps a substack (the indented blocks beneath it), e.g. \`control_forever():\`.
- For \`control_if_else\`, the blocks under the header run when the condition is true; a line reading \`else:\` (aligned with the header) separates them from the blocks that run when it is false.
- Input value notation: numbers are bare (\`10\`); text is quoted (\`"hello"\`); colors are hex (\`#ff0000\`); broadcasts are \`@message name\`; variables and lists are \`(name)\`; a nested reporter block is written inline; dropdown menus show their chosen value directly.
- Empty inputs are omitted. A substack is shown by indentation, not as an inline input.`;

/**
 * Scratch runtime facts injected into AI prompts so the model does not invent
 * concurrency or variable-sharing behavior that Scratch does not have.
 */
export const SCRATCH_SEMANTICS = `- Programs are cooperative, single-threaded, and frame-locked (e.g. a forever loop runs one iteration per frame and yields to all other scripts each frame; it cannot fire repeatedly before another script reacts). Do NOT assume normal-language concurrency.
- A global variable is shared by every sprite and every clone. A local variable is NOT shared between clones — each clone gets its own independent copy when created. Never claim that clones share a local variable.
- \`broadcast\` starts receivers but the sender keeps running; \`broadcast and wait\` pauses the sender until receivers finish. A flag set at the very start of a receiver is usually set before the sender's next loop iteration.
- Re-triggering a hat block restarts that script — it does not start a second concurrent copy. For example, re-broadcasting a message does not stack forever loops. The exception is clones: each clone runs its own copy of a \`control_start_as_clone()\` script.
- \`looks_switchcostumeto\` with a number selects a costume by position (1-based) and wraps out-of-range numbers.
- The Stage dimensions are (480, 360), with (0, 0) being the center.`;

/**
 * Escapes `<` and `>` characters in a string so it can be safely embedded in a prompt.
 *
 * @param value - The raw string to escape.
 * @returns The escaped string with `<` replaced by `&lt;` and `>` by `&gt;`.
 */
export function escapeForTag(value: string): string {
  return value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
