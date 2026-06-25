"use client";

import { useState } from "react";
import {
  AlertDialog,
  Button,
  Card,
  ComboBox,
  Description,
  Disclosure,
  DisclosureGroup,
  ErrorMessage,
  Input,
  Label,
  ListBox,
  Modal,
  Popover,
  Separator,
  Spinner,
  Surface,
  ToggleButton,
  useOverlayState,
} from "@heroui/react";
import {
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LightBulbIcon,
  SparklesIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";
import { ScriptStack } from "./ScriptStack";
import type { Script, AIFeedback, FeedbackStatus } from "@/types";

interface Props {
  raw: string | undefined;
  scripts: Record<string, Script[]>;
  aiFeedback: AIFeedback | null;
  feedbackStatus: FeedbackStatus;
  feedbackError: string | null;
  onGetFeedback: () => void;
  onDeleteRemix: () => Promise<void>;
  hasSelectedRemix: boolean;
  remixName: string | null;
  remixDescription: string | null;
  feedbackTimestamp: string | null;
  canDelete: boolean;
}

export function ScriptsPanel({
  raw,
  scripts,
  aiFeedback,
  feedbackStatus,
  feedbackError,
  onGetFeedback,
  onDeleteRemix,
  hasSelectedRemix,
  remixName,
  remixDescription,
  feedbackTimestamp,
  canDelete,
}: Props) {
  const isLoadingFeedback = feedbackStatus === "loading";
  // isEmpty overrides the toggle, as empty projects should be viewed raw.
  const isEmpty = Object.keys(scripts).length === 0;
  const [isRawToggled, setIsRawToggled] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(
    Object.keys(scripts).find((name) => scripts[name].length > 0) ?? "",
  );
  const targetScripts = scripts[selectedTarget] ?? [];

  const deleteState = useOverlayState();
  const [loading, setLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDeleteRemix() {
    setLoading(true);
    setDeleteError(null);
    try {
      await onDeleteRemix();
      deleteState.close();
    } catch (e) {
      setDeleteError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      <div className="flex flex-wrap gap-2 items-center">
        {hasSelectedRemix && !isEmpty && (
          <Modal>
            <Modal.Trigger>
              <Button size="sm">
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
                    {feedbackStatus === "error" && feedbackError && (
                      <ErrorMessage>{feedbackError}</ErrorMessage>
                    )}
                    {feedbackStatus === "empty" && (
                      <Card variant="secondary">
                        <Card.Content>
                          <p className="text-sm">
                            There&apos;s nothing to review here yet — add a few
                            blocks to your remix and try again!
                          </p>
                        </Card.Content>
                      </Card>
                    )}
                    {feedbackStatus === "ready" && aiFeedback && (
                      <Card variant="secondary">
                        <Card.Content className="overflow-auto">
                          <div>
                            <h4 className="text-base font-semibold">
                              What Works Well
                            </h4>
                            <div className="text-sm prose prose-code:before:content-none prose-code:after:content-none">
                              <ReactMarkdown>
                                {aiFeedback.what_works_well}
                              </ReactMarkdown>
                            </div>
                            <h4 className="text-base font-semibold mt-2">
                              Issues & Suggestions
                            </h4>
                            <div>
                              <DisclosureGroup>
                                {aiFeedback.logic_issues.map((issue, i) => {
                                  return (
                                    <div key={i}>
                                      <Disclosure>
                                        <Disclosure.Heading>
                                          <Button
                                            slot="trigger"
                                            variant="secondary"
                                            className="flex h-auto min-h-fit whitespace-normal bg-transparent justify-between gap-2 text-left text-danger"
                                            fullWidth
                                          >
                                            <div className="flex min-w-0 flex-1 items-center justify-start gap-2">
                                              <ExclamationTriangleIcon className="size-5 shrink-0" />
                                              <span className="min-w-0 whitespace-normal break-words text-left">
                                                {issue.title}
                                              </span>
                                            </div>
                                            <Disclosure.Indicator className="shrink-0" />
                                          </Button>
                                        </Disclosure.Heading>
                                        <Disclosure.Content>
                                          <Disclosure.Body>
                                            <div className="text-sm prose prose-code:before:content-none prose-code:after:content-none">
                                              <ReactMarkdown>
                                                {issue.detail}
                                              </ReactMarkdown>
                                            </div>
                                            <div className="flex flex-col items-center">
                                              <Button className="mt-2">
                                                <SparklesIcon />
                                                Generate Remix
                                              </Button>
                                            </div>
                                          </Disclosure.Body>
                                        </Disclosure.Content>
                                      </Disclosure>
                                      <Separator />
                                    </div>
                                  );
                                })}
                                {aiFeedback.suggestions.map((suggestion, i) => {
                                  return (
                                    <div key={i}>
                                      <Disclosure>
                                        <Disclosure.Heading>
                                          <Button
                                            slot="trigger"
                                            variant="secondary"
                                            className="flex h-auto min-h-fit whitespace-normal bg-transparent justify-between gap-2 text-left text-foreground"
                                            fullWidth
                                          >
                                            <div className="flex min-w-0 flex-1 items-center justify-start gap-2">
                                              <LightBulbIcon className="size-5 shrink-0" />
                                              <span className="min-w-0 whitespace-normal break-words text-left">
                                                {suggestion.title}
                                              </span>
                                            </div>
                                            <Disclosure.Indicator className="shrink-0" />
                                          </Button>
                                        </Disclosure.Heading>
                                        <Disclosure.Content>
                                          <Disclosure.Body>
                                            <div className="text-sm prose prose-code:before:content-none prose-code:after:content-none">
                                              <ReactMarkdown>
                                                {suggestion.detail}
                                              </ReactMarkdown>
                                            </div>
                                            <div className="flex flex-col items-center">
                                              <Button className="mt-2">
                                                <SparklesIcon />
                                                Generate Remix
                                              </Button>
                                            </div>
                                          </Disclosure.Body>
                                        </Disclosure.Content>
                                      </Disclosure>
                                      <Separator />
                                    </div>
                                  );
                                })}
                              </DisclosureGroup>
                            </div>
                          </div>
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
                          isDisabled={isLoadingFeedback}
                        >
                          {isLoadingFeedback && (
                            <Spinner size="sm" color="current" />
                          )}
                          {!isLoadingFeedback && (
                            <SparklesIcon className="h-4 w-4" />
                          )}
                          {isLoadingFeedback ? "Analyzing..." : "Get Feedback"}
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
        )}
        <ToggleButton
          isSelected={isEmpty || isRawToggled}
          onChange={setIsRawToggled}
          isDisabled={isEmpty}
          size="sm"
          className="sm:ml-auto"
        >
          Raw
        </ToggleButton>
        {raw && (
          <Button
            variant="secondary"
            size="sm"
            onPress={() => {
              const blob = new Blob([raw], {
                type: "application/json",
              });

              const url = URL.createObjectURL(blob);

              const a = document.createElement("a");

              a.href = url;
              a.download = "project.json";
              a.click();

              URL.revokeObjectURL(url);
            }}
          >
            <ArrowDownTrayIcon />
            Download
          </Button>
        )}
        {hasSelectedRemix && (
          <AlertDialog
            isOpen={deleteState.isOpen}
            onOpenChange={deleteState.setOpen}
          >
            <Button
              variant="danger-soft"
              size="sm"
              onPress={deleteState.open}
              isDisabled={!canDelete}
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </Button>

            <AlertDialog.Backdrop>
              <AlertDialog.Container>
                <AlertDialog.Dialog>
                  <AlertDialog.CloseTrigger className="m-3" />

                  <AlertDialog.Header>
                    <AlertDialog.Heading className="flex items-center gap-2 text-2xl mb-3">
                      <AlertDialog.Icon />
                      Delete Remix?
                    </AlertDialog.Heading>
                  </AlertDialog.Header>

                  <AlertDialog.Body>
                    <strong>{remixName}</strong> will be permanently deleted.
                    This cannot be undone.
                  </AlertDialog.Body>

                  <AlertDialog.Footer>
                    {deleteError && (
                      <p className="text-sm text-red-500">{deleteError}</p>
                    )}
                    <Button variant="outline" onPress={deleteState.close}>
                      Cancel
                    </Button>

                    <Button
                      variant="danger"
                      isDisabled={loading}
                      onPress={handleDeleteRemix}
                    >
                      {loading && <Spinner size="sm" />}
                      {loading ? "Deleting..." : "Delete"}
                    </Button>
                  </AlertDialog.Footer>
                </AlertDialog.Dialog>
              </AlertDialog.Container>
            </AlertDialog.Backdrop>
          </AlertDialog>
        )}
      </div>
      {isEmpty || isRawToggled ? (
        <Surface className="flex flex-1 overflow-auto whitespace-pre-wrap p-3 min-h-0 border rounded-lg">
          <code className="text-sm">{raw}</code>
        </Surface>
      ) : (
        <Surface className="flex-1 min-h-0 bg-grid bg-local border rounded-lg overflow-auto">
          <div className="sticky top-0 z-10 p-3">
            <ComboBox
              aria-label="Select target"
              variant="secondary"
              className="w-fit"
              isRequired
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
                    <ListBox.Item
                      key={name}
                      textValue={name}
                      isDisabled={scripts[name].length === 0}
                    >
                      <div className="flex flex-col">
                        <Label>{name}</Label>
                        <Description>
                          {scripts[name].length === 0
                            ? "empty"
                            : `${scripts[name].length} script${scripts[name].length !== 1 ? "s" : ""}`}
                        </Description>
                      </div>
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </ComboBox.Popover>
            </ComboBox>
          </div>
          <div className="columns-[320px] gap-3 p-3">
            {targetScripts.map((script) => (
              <div key={script.hatBlockId} className="break-inside-avoid mb-3">
                <ScriptStack script={script} />
              </div>
            ))}
          </div>
        </Surface>
      )}
    </div>
  );
}
