import {
  ScratchProject,
  Script,
  Block,
  BlockMap,
  ScratchPrimitive,
  ResolvedInput,
} from "@/types";

/** URL for Scratch's REST API. */
export const SCRATCH_API = "https://api.scratch.mit.edu";

/** URL for Scratch's project asset server. */
export const SCRATCH_PROJECTS = "https://projects.scratch.mit.edu";

/**
 * Decodes a raw `ScratchPrimitive` tuple into a `ResolvedInput`.
 *
 * Scratch encodes literal values as typed tuples (e.g. `[4, "10"]` is a
 * number literal, `[12, "my var", "uid"]` is a variable reference).
 *
 * @param primitive - Raw primitive tuple from a block's `inputs` slot.
 * @returns A `ResolvedInput`, identifying the primitive `type` and providing its value.
 */
export function parsePrimitive(primitive: ScratchPrimitive): ResolvedInput {
  const code = primitive[0];
  const value = primitive[1];

  switch (code) {
    case 4: // number
    case 5: // positive number
    case 6: // positive integer
    case 7: // integer
    case 8: // angle
      return { type: "number", value: Number(value) };
    case 9: // color "#rrggbb"
      return { type: "color", value: String(value) };
    case 10: // string
      return { type: "string", value: String(value) };
    case 11: // broadcast message
      return { type: "broadcast", name: String(value) };
    case 12: // variable - [12, name, id]
    case 13: {
      // list - [13, name, id]
      const [, name, id] = primitive as [12 | 13, string, string];
      return { type: code === 12 ? "variable" : "list", name, id };
    }
    default:
      return { type: "string", value: String(value) };
  }
}

/**
 * Parses a mutation's JSON-encoded string array (e.g. `argumentids`,
 * `argumentnames`) into a plain `string[]`.
 *
 * @param json - The raw JSON string from the mutation attribute.
 * @returns The parsed string array, or `[]` if the input is absent or malformed.
 */
export function parseMutationArray(json: string | undefined): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

/**
 * Fills a custom-block `proccode` signature by replacing its `%s`/`%n`/`%b`
 * argument placeholders with the supplied labels.
 * @param proccode - The raw procedure code string.
 * @param args - Ordered argument labels to substitute into each placeholder.
 * @returns The formatted signature.
 */
export function parseProcedureCode(proccode: string, args: string[]): string {
  let i = 0;
  return proccode.replace(/%[snb]/g, () => `(${args[i++] ?? "[ ]"})`);
}

/**
 * Resolves a named input slot on a block into a `ResolvedInput`.
 *
 * ```ts
 * const steps = getInputValue(block, 'STEPS');
 * // { type: 'number', value: 10 }
 * // or
 * // { type: 'block', blockId: '...' }  when a reporter block is plugged in
 * ```
 *
 * @param block - The block whose inputs map will be queried.
 * @param key - Input slot name as it appears in `block.inputs`, e.g. `"STEPS"`.
 * @returns The resolved value, or `{ type: "empty" }` if the slot is absent or null.
 */
export function getInputValue(block: Block, key: string): ResolvedInput {
  const input = block.inputs[key];
  if (!input) return { type: "empty" };

  const second = input[1];

  // Inline primitive: [1, ScratchPrimitive] e.g. [1, [4, "10"]]
  if (Array.isArray(second)) {
    return parsePrimitive(second as ScratchPrimitive);
  }

  // Reporter block plugged in: [1 | 2 | 3, "blockId", ...]
  // The string is always the ID of the reporter, shadow fallback is in input[2]
  if (typeof second === "string") {
    return { type: "block", blockId: second };
  }

  return { type: "empty" };
}

/**
 * Returns the display value of a named field (dropdown) on a block.
 *
 * Fields hold static selections like key names, directions, and rotation
 * styles. Unlike inputs, fields are always plain strings, so the function
 *  returns a string instead of a `ResolvedInput`.
 *
 * ```ts
 * const key = getFieldValue(block, 'KEY_OPTION'); // "right arrow"
 * const dir = getFieldValue(block, 'DIRECTION');  // "left-right"
 * ```
 *
 * @param block - The block whose fields map will be queried.
 * @param key   - Field name as it appears in `block.fields`, e.g. `"KEY_OPTION"`.
 * @returns The selected display string, or `null` if the field is absent.
 */
export function getFieldValue(block: Block, key: string): string | null {
  const field = block.fields[key];
  return field ? field[0] : null;
}

/**
 * Resolves all input slots on a block at once.
 *
 * Useful for iterating inputs without knowing the key names upfront.
 * Switch on each result's `type` to handle different value kinds:
 *
 * ```tsx
 * {Object.entries(getAllInputValues(block)).map(([key, input]) => {
 *   if (input.type !== 'number') return null
 *   return <span key={key}>{input.value}</span>
 * })}
 * ```
 *
 * @param block - The block whose inputs will be resolved.
 * @returns A record mapping each input key to its resolved value.
 */
export function getAllInputValues(block: Block): Record<string, ResolvedInput> {
  return Object.fromEntries(
    Object.keys(block.inputs).map((key) => [key, getInputValue(block, key)]),
  );
}

/**
 * Returns all field values on a block at once.
 *
 * Useful when you want to display every dropdown selection a block has
 * without knowing the key names upfront:
 *
 * ```tsx
 * {Object.entries(getAllFieldValues(block)).map(([key, value]) => (
 *   <span key={key}>{value}</span>
 * ))}
 * ```
 *
 * @param block - The block whose fields will be resolved.
 * @returns A record mapping each field key to its display string.
 */
export function getAllFieldValues(block: Block): Record<string, string> {
  return Object.fromEntries(
    Object.entries(block.fields).map(([key, field]) => [key, field[0]]),
  );
}

function collectBlocks(
  startId: string | null,
  blockMap: BlockMap,
  substackOnly: boolean,
  collected: Block[],
): void {
  let currentId: string | null = startId;

  while (currentId !== null) {
    const block = blockMap[currentId];
    if (!block) break;

    const stamped = { ...block, id: currentId };
    collected.push(stamped);

    if (substackOnly) {
      // Only recurse into C-block substack (SUBSTACK, SUBSTACK2)
      const substackKeys = Object.keys(stamped.inputs)
        .filter((key) => key.startsWith("SUBSTACK"))
        .sort(); // (e.g. in an "if" statement, collect the "then" blocks before the "else" blocks)
      for (const key of substackKeys) {
        const bodyId = stamped.inputs[key][1];
        if (typeof bodyId === "string")
          collectBlocks(bodyId, blockMap, substackOnly, collected);
      }
    } else {
      // Recurse into C-block bodies (e.g repeat, forever, if, if/else)
      for (const input of Object.values(getAllInputValues(stamped))) {
        if (input.type === "block")
          collectBlocks(input.blockId, blockMap, substackOnly, collected);
      }
    }

    currentId = block.next;
  }
}

/**
 * Returns every `Script` in a Scratch project, grouped by target name.
 *
 * @param project - A parsed Scratch project.
 * @param excludeReporters - When `true`, reporter inputs (boolean conditions, operators, sensing blocks, etc.) are excluded, useful if you intend to handle these blocks inline.
 * When `false` (default), all nested block inputs are collected recursively.
 * @returns A record mapping each target name to its array of `Script` objects.
 */
export function getScripts(
  project: ScratchProject,
  excludeReporters: boolean = false,
): Record<string, Script[]> {
  const result: Record<string, Script[]> = {};

  for (const target of project.targets) {
    const scripts: Script[] = [];
    for (const [id, block] of Object.entries(target.blocks)) {
      if (block.topLevel && !block.shadow) {
        const blocks: Block[] = [];
        collectBlocks(id, target.blocks, excludeReporters, blocks);
        scripts.push({ hatBlockId: id, hat: { ...block, id }, blocks });
      }
    }
    result[target.name] = scripts;
  }

  return result;
}

/**
 * Parses raw `project.json` text and returns every `Script` grouped by target name.
 *
 * ```ts
 * const scripts = parseScripts(raw)
 * scripts['Cat1'] // Script[] for the Cat1 sprite
 * scripts['Stage'] // Script[] for the Stage
 * ```
 *
 * @param raw - The full text content of a Scratch `project.json` file.
 * @param excludeReporters - When `true`, reporter inputs (boolean conditions, operators, sensing blocks, etc.) are excluded, useful if you intend to handle these blocks inline.
 * When `false` (default), all nested block inputs are collected recursively.
 * @returns A record mapping each target name to its array of `Script` objects.
 */
export function parseScripts(
  raw: string,
  excludeReporters: boolean = false,
): Record<string, Script[]> {
  return getScripts(JSON.parse(raw), excludeReporters);
}
