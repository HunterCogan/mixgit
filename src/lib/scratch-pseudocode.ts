import type { Block, ResolvedInput } from "@/types";
import { getAllFieldValues, getAllInputValues } from "@/lib/scratch";

export function computeIndents(blocks: Block[]): number[] {
  const blockMap = new Map(blocks.map((b) => [b.id, b]));
  const memo = new Map<string, number>();

  function depth(block: Block): number {
    if (memo.has(block.id)) return memo.get(block.id)!;
    let result: number;
    if (!block.parent) {
      result = 0;
    } else {
      const parent = blockMap.get(block.parent);

      // Sequential blocks (parent.next === block.id) have no nesting,
      // so they have the same indent: depth(parent)
      // Nested input (condition, operand, body, etc.) goes one deeper: depth(parent) + 1
      result =
        !parent || parent.next === block.id
          ? depth(parent ?? block)
          : depth(parent) + 1;
    }
    memo.set(block.id, result);
    return result;
  }

  return blocks.map(depth);
}

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

export function blockToLine(block: Block): string {
  const f = getAllFieldValues(block);
  const i = getAllInputValues(block);

  return `${block.opcode.replace(/_/g, " ")} fields: ${Object.entries(f).join(", ")} inputs: ${Object.values(i).map(inputLabel).join(", ")}`;
}
