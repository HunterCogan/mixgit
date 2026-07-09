import type { Block } from "@/types";
import { getAllInputValues, getAllFieldValues } from "@/lib/scratch";
import { ArrowUpIcon, CodeBracketSquareIcon } from "@heroicons/react/20/solid";
import { inputLabel } from "@/lib/scratch-pseudocode";

const CATEGORY_COLORS: Record<string, string> = {
  motion: "bg-category-motion",
  looks: "bg-category-looks",
  sound: "bg-category-sound",
  event: "bg-category-event",
  control: "bg-category-control",
  sensing: "bg-category-sensing",
  pen: "bg-category-pen",
  operator: "bg-category-operator",
  data: "bg-category-data",
  procedures: "bg-category-procedures",
  argument: "bg-category-argument",
};

function parseOpcode(opcode: string): { category: string; action: string } {
  const sep = opcode.indexOf("_");
  if (sep === -1) return { category: "", action: opcode };
  return { category: opcode.slice(0, sep), action: opcode.slice(sep + 1) };
}

interface Props {
  block: Block;
  indent: number;
  isReporter: boolean;
  lineNumber: number;
}

export function BlockRow({ block, indent, isReporter, lineNumber }: Props) {
  const { category, action } = parseOpcode(block.opcode);
  const color = CATEGORY_COLORS[category] ?? "bg-category-default";
  const fields = getAllFieldValues(block);
  const inputs = getAllInputValues(block);

  // padding for line indent, made more visible the further indented
  const padding = indent * 1.25;
  const paddingOpacity = Math.min(Math.max(indent / 10, 0), 1);

  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 p-1.5 text-sm text-white ${color}`}
    >
      <span className="font-mono text-xs opacity-50 select-none">
        {String(lineNumber).padStart(2, "0")}
      </span>
      <span
        style={{
          width: `${padding}rem`,
          height: `1rem`,
          opacity: paddingOpacity,
        }}
        className="bg-white rounded-md"
      ></span>
      {block.topLevel && <CodeBracketSquareIcon className="size-3" />}
      {isReporter && <ArrowUpIcon className="size-3" />}
      <span className="font-mono font-semibold tracking-wide">{action}</span>
      {Object.entries(fields).map(([k, v]) => (
        <span key={k} className="rounded bg-black/10 px-1 py-0.5 font-mono">
          {v}
        </span>
      ))}
      {Object.entries(inputs).map(([k, inp]) => {
        const label = inputLabel(inp);
        return label !== null ? (
          <span key={k} className="rounded bg-white/10 px-1 py-0.5 font-mono">
            {label}
          </span>
        ) : null;
      })}
    </div>
  );
}
