"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AlertDialog, Spinner, useOverlayState } from "@heroui/react";
import {
  Avatar,
  Button,
  Card,
  Chip,
  Link,
  ScrollShadow,
  Separator,
} from "@heroui/react";
import { parseScripts } from "@/lib/scratch";
import { ScriptsPanel } from "./ScriptsPanel";
import {
  ArrowDownTrayIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

export type RemixItem = {
  id: string;
  name: string;
  uploaderName: string;
  uploaderColor: string;
  description: string;
  isMain: boolean;
  projectJsonData: string;
  createdAt: string;
};

interface Props {
  remixes: RemixItem[];
}

export function ProjectContent({ remixes }: Props) {
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
        className="max-w-60 shrink-0 flex flex-col gap-3 p-2"
        hideScrollBar
      >
        <div className="flex flex-row justify-between">
          <h2 className="text-lg font-semibold">Remixes</h2>
          <Chip>{remixes.length}</Chip>
        </div>
        {remixes.length === 0 ? (
          <p className="text-sm text-gray-400">No remixes yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {remixes.map((remix) => (
              <Card
                key={remix.id}
                className={
                  remix.id === selectedId ? "ring-2 ring-green-500" : ""
                }
              >
                <Card.Header>
                  <Card.Title className="flex justify-between">
                    <div className="flex gap-2">
                      {remix.name}
                      {remix.isMain && (
                        <Chip size="sm">
                          <Chip.Label>main</Chip.Label>
                        </Chip>
                      )}
                    </div>
                    {remix.id === selectedId && (
                      <div className="w-2 h-2 rounded-full bg-green-500 self-center shrink-0" />
                    )}
                  </Card.Title>
                  <Card.Description>Created {remix.createdAt}</Card.Description>
                </Card.Header>
                <Card.Content className="flex flex-row gap-2 items-center">
                  <Avatar size="sm">
                    <Avatar.Fallback
                      style={{ backgroundColor: remix.uploaderColor }}
                    >
                      {remix.uploaderName.substring(0, 2).toUpperCase()}
                    </Avatar.Fallback>
                  </Avatar>
                  <span className="truncate text-sm"> {remix.description}</span>
                </Card.Content>
                <Card.Footer>
                  <Button
                    variant="outline"
                    onPress={() => {
                      setSelectedId(remix.id);
                      setAiFeedback(null);
                      setFeedbackTimestamp(null);
                    }}
                    fullWidth
                  >
                    <EyeIcon />
                    View
                  </Button>
                </Card.Footer>
              </Card>
            ))}
          </div>
        )}
      </ScrollShadow>
      <Separator orientation="vertical"></Separator>
      <div className="flex-1 min-w-0 flex flex-col gap-3 p-2">
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
                <Link href="#">
                  @{selectedRemix.uploaderName}
                  <Link.Icon />
                </Link>
              </Card.Description>
            </Card.Header>

            <Card.Content className="flex flex-row justify-between">
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
                  <Button variant="danger" size="sm" onPress={deleteState.open}>
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
                          {deleteError && (
                            <p className="text-sm text-red-500">
                              {deleteError}
                            </p>
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
              </div>
            </Card.Content>
          </Card>
        )}
      </div>
    </div>
  );
}
