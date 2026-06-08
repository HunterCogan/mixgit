"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Popover, ToggleButton } from "@heroui/react";
import { Avatar, Card, Chip, ScrollShadow, Link } from "@heroui/react";
import { parseScripts } from "@/lib/scratch";
import { ScriptsPanel } from "./ScriptsPanel";
import type { AIFeedback } from "@/types";
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
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbackTimestamp, setFeedbackTimestamp] = useState<string | null>(
    null,
  );

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
      const res = await fetch("/api/ai/feedback/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectJsonData: selectedRemix.projectJsonData,
          remixName: selectedRemix.name,
          remixDescription: selectedRemix.description,
        }),
      });
      const data = await res.json();
      setAiFeedback(data.feedback ?? null);
      setFeedbackTimestamp(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    } catch {
      setAiFeedback({
        what_works_well: "",
        suggestions: [],
        logic_issues: [],
        error: "Failed to get feedback. Please try again later.",
      });
    } finally {
      setLoadingFeedback(false);
    }
  }

  async function handleDeleteRemix() {
    if (!selectedRemix) return;
    const res = await fetch(`/api/remixes/${selectedRemix.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json();
      // this error is caught and rendered in ScriptsPanel
      throw new Error(
        typeof data.error === "string" ? data.error : "Failed to delete remix",
      );
    } else {
      setSelectedId(defaultId);
    }
    router.refresh();
  }

  return (
    <div className="flex gap-6 flex-1 min-h-0">
      <ScrollShadow className="w-xs shrink-0 flex flex-col gap-3 p-2">
        <div className="flex justify-between">
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
                variant={userId === remix.uploaderId ? "secondary" : "default"}
                className="gap-1"
              >
                <div className="flex flex-row items-center gap-2">
                  <Avatar size="sm" className="ring-2 ring-white">
                    <Avatar.Fallback
                      className="select-none"
                      style={{ backgroundColor: remix.uploaderColor }}
                    >
                      {remix.uploaderName.substring(0, 2).toUpperCase()}
                    </Avatar.Fallback>
                  </Avatar>
                  <Card.Header className="flex flex-row flex-1 items-center justify-between">
                    <Badge.Anchor>
                      <Card.Title className="pe-3">
                        {remix.name}
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
                      </Card.Title>
                    </Badge.Anchor>
                    <Card.Description>{remix.createdAt}</Card.Description>
                  </Card.Header>
                </div>
                <Card.Content>
                  <div className="flex justify-between items-end">
                    <p className="text-sm truncate">{remix.description}</p>
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
                      View
                    </ToggleButton>
                  </div>
                </Card.Content>
              </Card>
            ))}
          </div>
        )}
      </ScrollShadow>
      <div className="flex flex-1 flex-col justify-end min-w-0 gap-3 p-2">
        <div className="hidden [@media(min-height:500px)]:flex flex-col flex-1 min-h-0">
          <ScriptsPanel
            raw={selectedRemix?.projectJsonData}
            scripts={scripts}
            aiFeedback={aiFeedback}
            loadingFeedback={loadingFeedback}
            onGetFeedback={handleGetFeedback}
            onDeleteRemix={handleDeleteRemix}
            hasSelectedRemix={selectedRemix !== null}
            remixName={selectedRemix?.name ?? null}
            remixDescription={selectedRemix?.description ?? null}
            feedbackTimestamp={feedbackTimestamp}
            canDelete={
              selectedRemix !== null &&
              (userId === creatorId || userId === selectedRemix.uploaderId)
            }
          />
        </div>
        {selectedRemix && (
          <Card variant="tertiary">
            <Card.Header>
              <Card.Title>About this Remix</Card.Title>
              <Card.Description>
                <strong>{selectedRemix.name} </strong>created{" "}
                {selectedRemix.createdAt} by{" "}
                <Link
                  target="_blank"
                  href={`/users/${selectedRemix.uploaderId}`}
                >
                  {selectedRemix.uploaderName}
                  <Link.Icon />
                </Link>
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <ScrollShadow className="h-15">
                {selectedRemix.description}
              </ScrollShadow>
            </Card.Content>
          </Card>
        )}
      </div>
    </div>
  );
}
