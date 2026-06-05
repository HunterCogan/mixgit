"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  Badge,
  ErrorMessage,
  Popover,
  Spinner,
  ToggleButton,
  useOverlayState,
} from "@heroui/react";
import {
  Avatar,
  Button,
  Card,
  Chip,
  ScrollShadow,
  Separator,
  Link,
} from "@heroui/react";
import { parseScripts } from "@/lib/scratch";
import { ScriptsPanel } from "./ScriptsPanel";
import { ArrowDownTrayIcon, TrashIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/16/solid";

export type RemixItem = {
  id: string;
  name: string;
  uploaderName: string;
  uploaderId: string;
  uploaderColor: string;
  description: string;
  isMain: boolean;
  projectJsonData: string;
  createdAt: string;
};

interface Props {
  creatorId: string;
  userId: string;
  remixes: RemixItem[];
}

export function ProjectContent({ creatorId, userId, remixes }: Props) {
  const router = useRouter();
  const defaultId = (remixes.find((r) => r.isMain) ?? remixes[0])?.id ?? null;
  const [selectedId, setSelectedId] = useState<string | null>(defaultId);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbackTimestamp, setFeedbackTimestamp] = useState<string | null>(
    null,
  );

  const [loading, setLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteState = useOverlayState();

  const selectedRemix = remixes.find((r) => r.id === selectedId) ?? null;

  const scripts = useMemo(() => {
    if (!selectedRemix?.projectJsonData) return {};
    try {
      return parseScripts(selectedRemix.projectJsonData);
    } catch {
      return {};
    }
  }, [selectedRemix]);

  async function handleGetFeedback() {
    if (!selectedRemix) return;
    setLoadingFeedback(true);
    setAiFeedback(null);
    try {
      const res = await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectJsonData: selectedRemix.projectJsonData,
          remixName: selectedRemix.name,
          remixDescription: selectedRemix.description,
        }),
      });
      const data = await res.json();
      setAiFeedback(data.feedback ?? "No feedback returned.");
      setFeedbackTimestamp(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    } catch {
      setAiFeedback("Failed to get feedback. Please try again.");
    } finally {
      setLoadingFeedback(false);
    }
  }

  async function handleDeleteRemix() {
    if (!selectedRemix) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/remixes/${selectedRemix.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        deleteState.close();
        router.refresh();
      } else {
        const data = await res.json();
        setDeleteError(
          typeof data.error === "string"
            ? data.error
            : "Failed to delete remix",
        );
      }
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="flex gap-6 flex-1 min-h-0">
      <ScrollShadow
        className="w-xs shrink-0 flex flex-col gap-3 p-2"
        hideScrollBar
      >
        <div className="flex justify-between">
          <h2 className="text-lg font-semibold">Remixes</h2>
          <Chip>{remixes.length}</Chip>
        </div>
        {remixes.length === 0 ? (
          <p className="text-sm text-gray-400">No remixes yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {remixes.map((remix) => (
              <Card key={remix.id}>
                <div className="flex flex-row items-center gap-1">
                  <Avatar size="sm">
                    <Avatar.Fallback
                      className="select-none"
                      style={{ backgroundColor: remix.uploaderColor }}
                    >
                      {remix.uploaderName.substring(0, 2).toUpperCase()}
                    </Avatar.Fallback>
                  </Avatar>
                  <Card.Header className="flex flex-row flex-1 items-center justify-between">
                    <Badge.Anchor>
                      <Card.Title className="flex gap-1">
                        <ToggleButton
                          size="sm"
                          variant="ghost"
                          isSelected={remix.id === selectedId}
                          defaultSelected={remix.isMain}
                          onPress={() => {
                            setSelectedId(remix.id);
                            setAiFeedback(null);
                            setFeedbackTimestamp(null);
                          }}
                        >
                          {remix.name}
                        </ToggleButton>
                      </Card.Title>
                      {remix.isMain && (
                        <Popover>
                          <Popover.Trigger>
                            <Badge color="accent" size="sm">
                              <StarIcon className="size-2.5" />
                            </Badge>
                          </Popover.Trigger>
                          <Popover.Content>
                            <Popover.Dialog>
                              <p className="text-xs max-w-56">
                                {userId === creatorId ? (
                                  <span>You&apos;ve </span>
                                ) : (
                                  "The project owner has "
                                )}
                                marked this as the <strong>main </strong> mix,
                                the primary version of the codebase. New
                                contributors should start here!
                              </p>
                            </Popover.Dialog>
                          </Popover.Content>
                        </Popover>
                      )}
                    </Badge.Anchor>
                    <Card.Description>{remix.createdAt}</Card.Description>
                  </Card.Header>
                </div>
                <Card.Content>
                  <p className="text-xs truncate">{remix.description}</p>
                </Card.Content>
              </Card>
            ))}
          </div>
        )}
      </ScrollShadow>
      <Separator orientation="vertical"></Separator>
      <div className="flex flex-1 flex-col min-w-0 gap-3 p-2">
        <ScriptsPanel
          raw={selectedRemix?.projectJsonData}
          scripts={scripts}
          aiFeedback={aiFeedback}
          loadingFeedback={loadingFeedback}
          onGetFeedback={handleGetFeedback}
          remixName={selectedRemix?.name ?? null}
          remixDescription={selectedRemix?.description ?? null}
          feedbackTimestamp={feedbackTimestamp}
          hasSelectedRemix={selectedRemix !== null}
        />
        {selectedRemix && (
          <Card variant="secondary">
            <Card.Header>
              <Card.Title>About this Remix</Card.Title>
              <Card.Description>
                {selectedRemix.name} created {selectedRemix.createdAt} by{" "}
                <Link
                  target="_blank"
                  href={`/users/${selectedRemix.uploaderId}`}
                >
                  {selectedRemix.uploaderName}
                  <Link.Icon />
                </Link>
              </Card.Description>
            </Card.Header>

            <Card.Content className="flex justify-between">
              <ScrollShadow className="h-15">
                {selectedRemix.description}
              </ScrollShadow>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onPress={() => {
                    const blob = new Blob([selectedRemix.projectJsonData], {
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
                <AlertDialog
                  isOpen={deleteState.isOpen}
                  onOpenChange={deleteState.setOpen}
                >
                  <Button
                    variant="danger"
                    size="sm"
                    onPress={deleteState.open}
                    isDisabled={
                      userId !== creatorId &&
                      userId !== selectedRemix.uploaderId
                    }
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
                          <strong>{selectedRemix.name}</strong> will be
                          permanently deleted. This cannot be undone.
                        </AlertDialog.Body>

                        <AlertDialog.Footer>
                          <ErrorMessage>{deleteError}</ErrorMessage>
                          <Button
                            variant="tertiary"
                            onPress={deleteState.close}
                          >
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
              </div>
            </Card.Content>
          </Card>
        )}
      </div>
    </div>
  );
}
