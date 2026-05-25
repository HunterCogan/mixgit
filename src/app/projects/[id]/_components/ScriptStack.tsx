import type { Script, Block } from "@/types";
import { BlockRow } from "./BlockRow";
import { Card } from "@heroui/react";

function computeIndents(blocks: Block[]): number[] {
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

function isBlockReporter(block: Block, blockMap: Map<string, Block>): boolean {
  if (!block.parent) return false;
  const parent = blockMap.get(block.parent);
  // Block is inline if block is inside of parent (parent.next != block.id)
  // but not a substack.
  if (!parent || parent.next === block.id) return false;
  const isSubstack =
    parent.inputs["SUBSTACK"]?.[1] === block.id ||
    parent.inputs["SUBSTACK2"]?.[1] === block.id;
  return !isSubstack;
}

interface Props {
  script: Script;
}

export function ScriptStack({ script }: Props) {
  const { blocks } = script;
  const blockMap = new Map(blocks.map((b) => [b.id, b]));
  const indents = computeIndents(blocks);
  const blockReporters = blocks.map((b) => isBlockReporter(b, blockMap));
  // Line number increments on non-reporter blocks
  const lineNumbers = blocks.reduce<number[]>((acc, block, i) => {
    const prev = acc[i - 1] ?? 0;
    acc.push(blockReporters[i] ? prev : prev + 1);
    return acc;
  }, []);

  return (
    <Card className="w-fit h-fit rounded-md p-1" variant="secondary">
      <Card.Content className="gap-0 overflow-hidden rounded-md">
        {blocks.map((block, i) => {
          return (
            <BlockRow
              key={`${script.hatBlockId}-${i}`}
              block={block}
              indent={indents[i]}
              isReporter={blockReporters[i]}
              lineNumber={lineNumbers[i]}
            />
          );
        })}
      </Card.Content>
    </Card>
  );
}
