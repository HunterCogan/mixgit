import type { Script } from "@/types";
import { ScriptStack } from "./ScriptStack";
import { Surface } from "@heroui/react";

interface Props {
  scripts: Record<string, Script[]>;
  selectedTarget: string;
}

export function ScriptView({ scripts, selectedTarget }: Props) {
  const targetScripts = scripts[selectedTarget] ?? [];

  if (targetScripts.length === 0) {
    return (
      <p className="text-sm italic text-gray-500">
        No scripts for {selectedTarget}.
      </p>
    );
  }

  return (
    <Surface
      className="flex flex-wrap gap-3 p-3 justify-center border-1 rounded-md flex-1 min-h-0 overflow-auto"
      variant="secondary"
    >
      {targetScripts.map((script) => (
        <ScriptStack key={script.hatBlockId} script={script} />
      ))}
    </Surface>
  );
}
