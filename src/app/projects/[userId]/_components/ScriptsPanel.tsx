"use client";

import { useState } from "react";
import { ComboBox, Input, Label, ListBox, Surface } from "@heroui/react";
import { ScriptStack } from "./ScriptStack";
import type { Script } from "@/types";

interface Props {
  scripts: Record<string, Script[]>;
}

export function ScriptsPanel({ scripts }: Props) {
  const [selectedTarget, setSelectedTarget] = useState(
    Object.keys(scripts)[0] ?? "",
  );
  const targetScripts = scripts[selectedTarget] ?? [];

  if (Object.keys(scripts).length === 0) {
    return (
      <div className="flex flex-col gap-4 flex-1 min-h-0">
        <p className="text-sm italic text-gray-400">No scripts available.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      <ComboBox
        className="w-fit"
        inputValue={selectedTarget}
        onInputChange={(value) => setSelectedTarget(value)}
      >
        <Label>Selected Target</Label>
        <ComboBox.InputGroup>
          <Input placeholder="Search targets..." />
          <ComboBox.Trigger />
        </ComboBox.InputGroup>
        <ComboBox.Popover>
          <ListBox>
            {Object.keys(scripts).map((name) => (
              <ListBox.Item key={name} textValue={name}>
                {name}
              </ListBox.Item>
            ))}
          </ListBox>
        </ComboBox.Popover>
      </ComboBox>
      {targetScripts.length === 0 ? (
        <p className="text-sm italic text-gray-500">
          No scripts for {selectedTarget}.
        </p>
      ) : (
        <Surface
          className="flex flex-wrap gap-3 p-3 justify-around flex-1 min-h-0 overflow-auto bg-grid border-1 rounded-lg"
          variant="transparent"
        >
          {targetScripts.map((script) => (
            <ScriptStack key={script.hatBlockId} script={script} />
          ))}
        </Surface>
      )}
    </div>
  );
}
