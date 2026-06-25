/**
 * System-level tone instructions injected into prompts.
 */
export const TONE = `Lead with genuine praise. Make every suggestion concrete and tied to a real block the student can add or change. If there are no clear logic issues, do not fabricate one.`;

/**
 * Escapes `<` and `>` characters in a string so it can be safely embedded in a prompt.
 *
 * @param value - The raw string to escape.
 * @returns The escaped string with `<` replaced by `&lt;` and `>` by `&gt;`.
 */
export function escapeForTag(value: string): string {
  return value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
