"use client";

import { useState } from "react";
import {
  Button,
  Card,
  ComboBox,
  Input,
  ListBox,
  Modal,
  Popover,
  Separator,
  Spinner,
  Surface,
  ToggleButton,
} from "@heroui/react";
import {
  InformationCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { ScriptStack } from "./ScriptStack";
import type { Script } from "@/types";

interface Props {
  raw: string | undefined;
  scripts: Record<string, Script[]>;
  aiFeedback: string | null;
  loadingFeedback: boolean;
  onGetFeedback: () => void;
  remixName: string | null;
  remixDescription: string | null;
  feedbackTimestamp: string | null;
}

export function ScriptsPanel({
  raw,
  scripts,
  aiFeedback,
  loadingFeedback,
  onGetFeedback,
  remixName,
  remixDescription,
  feedbackTimestamp,
}: Props) {
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
        <Modal>
          <Modal.Trigger>
            <Button>
              <SparklesIcon className="h-4 w-4" />
              AI Feedback
            </Button>
          </Modal.Trigger>
          <Modal.Backdrop>
            <Modal.Container size="lg">
              <Modal.Dialog>
                <Modal.CloseTrigger className="m-2" />
                <Modal.Header>
                  <Modal.Heading className="text-2xl">
                    AI Feedback
                  </Modal.Heading>
                </Modal.Header>
                <Separator className="my-4" />
                <Modal.Body className="flex flex-col gap-1">
                  {remixName && (
                    <h3 className="text-base font-semibold">
                      <span className="font-normal">Feedback for: </span>
                      {remixName}
                    </h3>
                  )}
                  {remixDescription && (
                    <p className="text-sm mb-4">{remixDescription}</p>
                  )}
                  {aiFeedback && (
                    <Card variant="secondary" className="pt-1">
                      <Card.Content className="overflow-auto">
                        {aiFeedback.split("\n").map((line, i) =>
                          line.startsWith("## ") ? (
                            <p key={i} className="font-bold mt-2">
                              {line.slice(3)}
                            </p>
                          ) : (
                            <p key={i}>{line}</p>
                          ),
                        )}
                      </Card.Content>
                    </Card>
                  )}
                </Modal.Body>
                <Modal.Footer className="flex justify-between items-center">
                  {feedbackTimestamp ? (
                    <p className="text-xs text-gray-400">
                      Generated at {feedbackTimestamp}
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        onPress={onGetFeedback}
                        isDisabled={loadingFeedback}
                      >
                        {loadingFeedback && (
                          <Spinner size="sm" color="current" />
                        )}
                        {!loadingFeedback && (
                          <SparklesIcon className="h-4 w-4" />
                        )}
                        {loadingFeedback ? "Analyzing..." : "Get Feedback"}
                      </Button>
                      <Popover>
                        <Popover.Trigger>
                          <InformationCircleIcon className="h-4 w-4 text-gray-400 cursor-pointer" />
                        </Popover.Trigger>
                        <Popover.Content className="mt-2">
                          <Popover.Arrow />
                          <Popover.Dialog>
                            <p className="text-xs max-w-56">
                              Analyzes this remix&apos;s code and provides
                              suggestions for improvement, highlights what it
                              does well, and flags any logic issues.
                            </p>
                          </Popover.Dialog>
                        </Popover.Content>
                      </Popover>
                    </div>
                  )}
                  <Button slot="close" variant="outline">
                    Close
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
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
