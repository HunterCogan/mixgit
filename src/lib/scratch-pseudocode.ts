import type {
  Block,
  BlockMap,
  ResolvedInput,
  ScratchProject,
  Script,
} from "@/types";
import {
  getAllFieldValues,
  getAllInputValues,
  getScripts,
} from "@/lib/scratch";

/**
 * Computes the indentation level for each block in a Scratch script.
 *
 * Sequential blocks (linked via `block.next`) share their parent's indent level.
 * Blocks nested as inputs are indented one level deeper than their parent.
 *
 * @param blocks - List of blocks in a script, in traversal order (e.g. as produced by `parseScripts`).
 * @returns - Array of indent depths, one per block, in the same order as `blocks`.
 */
export function computeIndents(blocks: Script["blocks"]): number[] {
  const idMap = new Map(blocks.map((b) => [b.id, b]));
  const memo = new Map<string, number>();

  function depth(block: Block): number {
    if (memo.has(block.id)) return memo.get(block.id)!;
    let result: number;
    if (!block.parent) {
      result = 0;
    } else {
      const parent = idMap.get(block.parent);
      if (!parent) {
        // Parent ID is set but not present in this script: fall back to 0 (shouldn't happen in valid scripts).
        result = 0;
      } else if (parent.next === block.id) {
        // Sequential: same indent as parent.
        result = depth(parent);
      } else {
        // Nested input (condition, body, operand, etc.): one level deeper.
        result = depth(parent) + 1;
      }
    }
    memo.set(block.id, result);
    return result;
  }

  return blocks.map(depth);
}

/**
 * Converts a resolved input value to its inline representation.
 *
 * @param input - A `ResolvedInput` produced by `getInputValue` or `getAllInputValues`.
 * @returns The inline label string, or `null` if the input type has no textual representation.
 */
export function inputLabel(input: ResolvedInput): string | null {
  switch (input.type) {
    case "number":
      return String(input.value);
    case "string":
      return isNaN(Number(input.value)) // only add quotes if NaN (Scratch treats numbers casted to "string" as numeric)
        ? `"${input.value}"`
        : String(input.value);
    case "color":
      return input.value;
    case "broadcast":
      return `@${input.name}`;
    case "variable":
    case "list":
      return `(${input.name})`;
    case "block":
      return `[ ]`;
    default:
      return null;
  }
}

function blockToLine(block: Block, blockMap: BlockMap): string {
  const f = getAllFieldValues(block);
  const i = getAllInputValues(block);

  const fieldParts = Object.entries(f).map(([key, value]) => `${key}=${value}`);
  // Inline inputs are rendered as key=value pairs, with nested blocks recursively rendered in place
  const inputParts = Object.entries(i)
    .filter(([key, input]) => {
      // Filter out empty and SUBSTACK inputs from inline inputs
      if (input.type === "empty") return false;
      if (input.type === "block" && key.startsWith("SUBSTACK")) return false;
      return true;
    })
    .map(([key, input]) => {
      if (input.type === "block") {
        const nested = blockMap[input.blockId];
        if (!nested) return `${key}=[ ]`;
        if (nested.shadow) {
          // Shadow blocks are dropdown menus so return their field value directly
          // e.g. returns Cat Flying1 instead of touchingobjectmenu(TOUCHINGOBJECTMENU=Cat1 Flying)
          const values = Object.values(nested.fields).map((f) => f[0]);
          return `${key}=${values.join(" ") || "[ ]"}`;
        }
        return `${key}=${blockToLine(nested, blockMap)}`;
      }
      return `${key}=${inputLabel(input)}`;
    });

  const hasSubstack = Object.entries(i).some(
    ([key, input]) => input.type === "block" && key.startsWith("SUBSTACK"),
  );
  return `${block.opcode}(${[...fieldParts, ...inputParts].join(", ")})${hasSubstack ? ":" : ""}`;
}

/**
 * Converts a raw Scratch `project.json` string into a human-readable pseudocode
 * representation of its scripts.
 *
 * Each target section lists its local/global variables, costumes, and scripts.
 * Returns `raw` unchanged if parsing fails.
 *
 * @param raw The full text content of a Scratch `project.json` file.
 * @param targets Optional allowlist of target names to include. When omitted, all targets are included.
 * @returns A multi-line pseudocode string, or `raw` if the input cannot be parsed.
 */
export function rawToPseudocode(raw: string, targets?: string[]): string {
  try {
    const project: ScratchProject = JSON.parse(raw);
    // Create a full block map because getScripts(project, true) excludes reporter blocks
    // but we need access to these excluded blocks to render inline in blockToLine
    const blockMaps = Object.fromEntries(
      project.targets.map((t) => [t.name, t.blocks]),
    );
    const scripts = getScripts(project, true);
    let pseudocode = "";
    for (const [targetName, targetScripts] of Object.entries(scripts)) {
      if (!targets || targets.includes(targetName)) {
        const blockMap = blockMaps[targetName];
        const target = project.targets.find((t) => t.name === targetName);

        // Target header (name, variables, costumes)
        pseudocode += `Target: ${targetName}\n`;
        if (target?.variables && Object.values(target.variables).length > 0) {
          pseudocode += `${target?.isStage ? "Global" : "Local"} variables: [${Object.values(
            target.variables,
          )
            .map((v) => `${v[0]}=${v[1]}`)
            .join(", ")}]\n`;
        }
        if (target?.costumes && Object.values(target.costumes).length > 0) {
          pseudocode += `Costumes: [${Object.values(target.costumes)
            .map((c) => c.name)
            .join(", ")}]\n`;
        }

        // Target body (scripts)
        if (targetScripts.length === 0) {
          pseudocode += "No scripts\n\n";
          continue;
        } else {
          for (const script of targetScripts) {
            const indents = computeIndents(script.blocks);
            for (const [i, block] of script.blocks.entries()) {
              pseudocode +=
                i === 0
                  ? `${blockToLine(block, blockMap)}:\n`
                  : `${"\t".repeat(indents[i] + 1)}${blockToLine(block, blockMap)}\n`;
            }
          }
          pseudocode += "\n";
        }
      }
    }
    return pseudocode.trim();
  } catch {
    return raw;
  }
}
