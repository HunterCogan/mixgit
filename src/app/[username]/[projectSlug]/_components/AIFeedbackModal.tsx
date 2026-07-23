"use client";

import {
  Button,
  Card,
  Disclosure,
  DisclosureGroup,
  ErrorMessage,
  Modal,
  Popover,
  Separator,
  Spinner,
  Tooltip,
} from "@heroui/react";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LightBulbIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";
import type { AIFeedback, AIFeedbackTopic, FeedbackStatus } from "@/types";

interface Props {
  aiFeedback: AIFeedback | null;
  feedbackStatus: FeedbackStatus;
  feedbackError: string | null;
  onGetFeedback: (force?: boolean) => void;
  remixId: string | null;
  remixName: string | null;
  remixDescription: string | null;
  feedbackTimestamp: string | null;
  isLoggedIn: boolean;
  canUseAIFeedback: boolean;
}

export function AIFeedbackModal({
  aiFeedback,
  feedbackStatus,
  feedbackError,
  onGetFeedback,
  remixId,
  remixName,
  remixDescription,
  feedbackTimestamp,
  isLoggedIn,
  canUseAIFeedback,
}: Props) {
  const isLoadingFeedback = feedbackStatus === "loading";
  const isCheckingFeedback = feedbackStatus === "checking";

  async function handleGenerateRemix(topic: AIFeedbackTopic) {
    if (!remixId) return;
    await fetch("/api/ai/generate/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ remixId, topic }),
    });
  }

  if (!canUseAIFeedback) {
    return (
      <div className="flex items-center gap-1">
        <Button size="sm" isDisabled>
          <SparklesIcon className="h-4 w-4" />
          AI Feedback
        </Button>
        <Tooltip delay={0}>
          <Tooltip.Trigger>
            <InformationCircleIcon className="h-4 w-4 text-gray-400 cursor-pointer" />
          </Tooltip.Trigger>
          <Tooltip.Content>
            {isLoggedIn
              ? "You need to be a Collaborator to use AI Feedback."
              : "You need to be signed in to use AI Feedback."}
          </Tooltip.Content>
        </Tooltip>
      </div>
    );
  }

  return (
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
              <Modal.Heading className="text-2xl">AI Feedback</Modal.Heading>
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
                      There&apos;s nothing to review here yet — add a few blocks
                      to your remix and try again!
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
                                        <span className="min-w-0 whitespace-normal wrap-break-word text-left">
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
                                        <Button
                                          className="mt-2"
                                          onPress={() =>
                                            handleGenerateRemix(issue)
                                          }
                                        >
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
                                        <span className="min-w-0 whitespace-normal wrap-break-word text-left">
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
                                        <Button
                                          className="mt-2"
                                          onPress={() =>
                                            handleGenerateRemix(suggestion)
                                          }
                                        >
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
              {feedbackStatus === "ready" ? (
                <div className="flex items-center gap-3">
                  <Button
                    onPress={() => onGetFeedback(true)}
                    isDisabled={isLoadingFeedback}
                  >
                    {isLoadingFeedback && <Spinner size="sm" color="current" />}
                    {!isLoadingFeedback && <SparklesIcon className="h-4 w-4" />}
                    {isLoadingFeedback
                      ? "Regenerating..."
                      : "Regenerate Feedback"}
                  </Button>
                  {feedbackTimestamp && (
                    <p className="text-xs text-gray-400">
                      Generated at {feedbackTimestamp}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    onPress={() => onGetFeedback(false)}
                    isDisabled={isLoadingFeedback || isCheckingFeedback}
                  >
                    {(isLoadingFeedback || isCheckingFeedback) && (
                      <Spinner size="sm" color="current" />
                    )}
                    {!isLoadingFeedback && !isCheckingFeedback && (
                      <SparklesIcon className="h-4 w-4" />
                    )}
                    {isLoadingFeedback
                      ? "Analyzing..."
                      : isCheckingFeedback
                        ? "Checking..."
                        : "Get Feedback"}
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
                          suggestions for improvement, highlights what it does
                          well, and flags any logic issues.
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
  );
}
