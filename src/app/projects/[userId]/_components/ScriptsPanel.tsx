"use client";

import { useState } from "react";
import { ComboBox, Input, ListBox, Surface, ToggleButton } from "@heroui/react";
import { ScriptStack } from "./ScriptStack";
import type { Script } from "@/types";

interface Props {
  raw: string | undefined;
  scripts: Record<string, Script[]>;
}

export function ScriptsPanel({ raw, scripts }: Props) {
  // isEmpty overrides the toggle, as empty projects should be viewed raw.
  const isEmpty = Object.keys(scripts).length === 0;
  const [isRawToggled, setIsRawToggled] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(
    Object.keys(scripts)[0] ?? "",
  );
  const targetScripts = scripts[selectedTarget] ?? [];

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      <div className="flex gap-2">
        <ToggleButton
          isSelected={isEmpty || isRawToggled}
          onChange={setIsRawToggled}
          isDisabled={isEmpty}
        >
          Raw
        </ToggleButton>
        {!isEmpty && (
          <ComboBox
            aria-label="Select target"
            className="w-fit"
            inputValue={selectedTarget}
            onInputChange={(value) => setSelectedTarget(value)}
          >
            <ComboBox.InputGroup>
              <Input placeholder="Search targets..." />
              <ComboBox.Trigger />
            </ComboBox.InputGroup>
            <ComboBox.Popover>
              <ListBox>
                {Object.keys(scripts).map((name) => (
                  <ListBox.Item key={name} textValue={name}>
                    {name}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </ComboBox.Popover>
          </ComboBox>
        )}
      </div>
      {isEmpty || isRawToggled ? (
        <Surface className="flex flex-wrap flex-1 overflow-auto whitespace-pre-wrap p-3 min-h-0 border-1 rounded-lg">
          {raw}
        </Surface>
      ) : (
        <Surface className="flex flex-wrap gap-3 p-3 justify-around flex-1 min-h-0 overflow-auto bg-grid border-1 rounded-lg">
          {targetScripts.map((script) => (
            <ScriptStack key={script.hatBlockId} script={script} />
          ))}
        </Surface>
      )}
    </div>
  );
}
