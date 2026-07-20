"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Label, Popover, ToggleButton } from "@heroui/react";
import { Avatar, Card, Chip, ScrollShadow, Link } from "@heroui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { parseScripts } from "@/lib/scratch";
import { fileNameToLanguage } from "@/lib/language";
import { ScriptsPanel } from "./ScriptsPanel";
import CreateRawRemixModal from "./CreateRawRemixModal";
import type { AIFeedback, FeedbackStatus } from "@/types";
import { StarIcon } from "@heroicons/react/16/solid";

function subscribeToDesktop(cb: () => void) {
  const mq = window.matchMedia("(min-width: 640px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const getDesktopSnapshot = () =>
  window.matchMedia("(min-width: 640px)").matches;
const getDesktopServerSnapshot = () => false;

export type RemixFile = {
  name: string;
  fileType: "asset" | "logic";
  data?: string;
};

export type RemixItem = {
  id: string;
  name: string;
  uploaderName: string;
  uploaderId: string;
  uploaderUsername: string;
  uploaderColor: string;
  uploaderImagePath?: string;
  description: string;
  isMain: boolean;
  createdAt: string;
  remixType: "blockcode" | "raw";
  files: RemixFile[];
};

interface Props {
  projectId: string;
  creatorId: string;
  userId: string | undefined;
  isCollaborator: boolean;
  remixes: RemixItem[];
  visibility: "public" | "private";
}

export function ProjectContent({
  projectId,
  creatorId,
  userId,
  isCollaborator,
  remixes: initialRemixes,
}: Props) {
  const router = useRouter();

  const [codeOverrides, setCodeOverrides] = useState<
    Record<string, Record<string, string>>
  >({});

  const remixes = useMemo(
    () =>
      initialRemixes.map((r) => {
        const overrides = codeOverrides[r.id];
        if (!overrides) return r;
        return {
          ...r,
          files: r.files.map((f) =>
            f.name in overrides ? { ...f, data: overrides[f.name] } : f,
          ),
        };
      }),
    [initialRemixes, codeOverrides],
  );

  const [selectedId, setSelectedId] = useState<string | null>(
    (initialRemixes.find((r) => r.isMain) ?? initialRemixes[0])?.id ?? null,
  );

  const safeSelectedId = useMemo(() => {
    if (selectedId && remixes.find((r) => r.id === selectedId))
      return selectedId;
    return (remixes.find((r) => r.isMain) ?? remixes[0])?.id ?? null;
  }, [selectedId, remixes]);

  const [selectedFileByRemix, setSelectedFileByRemix] = useState<
    Record<string, string>
  >({});

  const [panelWidth, setPanelWidth] = useState(240);
  const [collapsed, setCollapsed] = useState(false);
  const isDesktop = useSyncExternalStore(
    subscribeToDesktop,
    getDesktopSnapshot,
    getDesktopServerSnapshot,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  function startResize(e: React.MouseEvent) {
    e.preventDefault();
    isResizing.current = true;
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing.current || !containerRef.current) return;
      const containerLeft = containerRef.current.getBoundingClientRect().left;
      const maxWidth = containerRef.current.offsetWidth / 3;
      const newWidth = Math.max(
        160,
        Math.min(e.clientX - containerLeft, maxWidth),
      );
      setPanelWidth(newWidth);
    };
    const onMouseUp = () => {
      isResizing.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatus>("idle");
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackTimestamp, setFeedbackTimestamp] = useState<string | null>(
    null,
  );

  const selectedRemix = remixes.find((r) => r.id === safeSelectedId) ?? null;

  const selectedFileName = useMemo(() => {
    if (!selectedRemix) return "";
    const explicit = selectedFileByRemix[selectedRemix.id];
    if (explicit && selectedRemix.files.some((f) => f.name === explicit))
      return explicit;
    return selectedRemix.files[0]?.name ?? "";
  }, [selectedRemix, selectedFileByRemix]);

  function handleSelectFile(fileName: string) {
    if (!selectedRemix) return;
    setSelectedFileByRemix((prev) => ({
      ...prev,
      [selectedRemix.id]: fileName,
    }));
  }

  const scripts = useMemo(() => {
    const data = selectedRemix?.files[0]?.data;
    if (!data) return {};
    try {
      return parseScripts(data);
    } catch {
      return {};
    }
  }, [selectedRemix]);

  async function handleGetFeedback() {
    if (!selectedRemix) return;
    setFeedbackStatus("loading");
    setAiFeedback(null);
    setFeedbackError(null);
    try {
      const endpoint =
        selectedRemix.remixType === "raw"
          ? "/api/ai/feedback/raw"
          : "/api/ai/feedback/block";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          remixId: selectedRemix.id,
          fileName: selectedFileName,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedbackError(
          data.error ??
            "Something went wrong on our end. Please try again later.",
        );
        setFeedbackStatus("error");
        return;
      }
      if (data.feedback) {
        setAiFeedback(data.feedback);
        setFeedbackStatus("ready");
      } else {
        setFeedbackStatus("empty");
      }
      setFeedbackTimestamp(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    } catch {
      setFeedbackError("Network error. Check your connection and try again.");
      setFeedbackStatus("error");
    }
  }

  function handleCodeSaved(remixId: string, fileName: string, code: string) {
    setCodeOverrides((prev) => ({
      ...prev,
      [remixId]: { ...(prev[remixId] ?? {}), [fileName]: code },
    }));
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
    }
    router.refresh();
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col sm:flex-row gap-4 sm:gap-0 flex-1 overflow-auto sm:overflow-hidden min-h-50"
    >
      <div
        className={`w-full sm:shrink-0 flex flex-col gap-3 p-2 min-h-44 max-h-[35vh] sm:max-h-none sm:min-h-0 ${collapsed ? "hidden" : ""}`}
        style={isDesktop && !collapsed ? { width: panelWidth } : undefined}
      >
        <div className="flex justify-between items-center shrink-0">
          <Label className="text-lg font-semibold">Remixes</Label>
          <div className="flex items-center gap-1">
            {isCollaborator && (
              <CreateRawRemixModal
                projectId={projectId}
                creatorId={creatorId}
                onCreated={setSelectedId}
              />
            )}
            <Chip size="lg">{remixes.length}</Chip>
            <Button
              className="hidden sm:flex"
              size="sm"
              variant="ghost"
              isIconOnly
              onPress={() => setCollapsed(true)}
              aria-label="Collapse remix panel"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <ScrollShadow
          className="flex flex-col gap-3 flex-1 min-h-0 overflow-auto"
          hideScrollBar
        >
          {remixes.length === 0 ? (
            <p className="text-sm text-gray-400">No remixes yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {remixes.map((remix) => (
                <Card
                  key={remix.id}
                  variant={
                    userId === remix.uploaderId ? "secondary" : "default"
                  }
                  className="gap-1"
                >
                  <div className="flex flex-row items-center gap-2">
                    <Avatar size="sm" className="ring-2 ring-white">
                      {remix.uploaderImagePath && (
                        <Avatar.Image
                          src={`https://scratchpad-profile-images.s3.us-east-1.amazonaws.com/${remix.uploaderImagePath}`}
                          alt={remix.uploaderName}
                        />
                      )}

                      <Avatar.Fallback
                        className="select-none"
                        style={{ backgroundColor: remix.uploaderColor }}
                      >
                        {remix.uploaderName.substring(0, 2).toUpperCase()}
                      </Avatar.Fallback>
                    </Avatar>
                    <Card.Header className="flex flex-row flex-1 items-center justify-between">
                      <Badge.Anchor className="shrink">
                        <Card.Title className="pe-3 line-clamp-1">
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
                                    marked this as the <strong>main </strong>{" "}
                                    mix, the primary version of the codebase.
                                    New contributors should start here!
                                  </p>
                                </Popover.Dialog>
                              </Popover.Content>
                            </Popover>
                          )}
                        </Card.Title>
                      </Badge.Anchor>
                      <Card.Description className="shrink-0">
                        {remix.createdAt}
                      </Card.Description>
                    </Card.Header>
                  </div>
                  <Card.Content>
                    <div className="flex justify-between items-end">
                      <p className="text-sm truncate">{remix.description}</p>
                      <ToggleButton
                        size="sm"
                        variant="ghost"
                        isSelected={remix.id === safeSelectedId}
                        defaultSelected={remix.isMain}
                        onPress={() => {
                          setSelectedId(remix.id);
                          setAiFeedback(null);
                          setFeedbackError(null);
                          setFeedbackStatus("idle");
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
      </div>

      {!collapsed && (
        <div
          className="hidden sm:flex items-center justify-center w-2 shrink-0 cursor-col-resize group hover:bg-border/40 transition-colors"
          onMouseDown={startResize}
        >
          <div className="w-px h-10 bg-border rounded-full group-hover:bg-foreground/30 transition-colors" />
        </div>
      )}

      {collapsed && (
        <div className="hidden sm:flex shrink-0 pt-1">
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            onPress={() => setCollapsed(false)}
            aria-label="Expand remix panel"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex flex-1 flex-col justify-end min-w-0 gap-3 p-2">
        <div className="hidden [@media(min-height:500px)]:flex flex-col flex-1 min-h-0">
          <ScriptsPanel
            key={safeSelectedId ?? ""}
            files={selectedRemix?.files ?? []}
            selectedFileName={selectedFileName}
            onSelectFile={handleSelectFile}
            scripts={scripts}
            aiFeedback={aiFeedback}
            feedbackStatus={feedbackStatus}
            feedbackError={feedbackError}
            onGetFeedback={handleGetFeedback}
            onDeleteRemix={handleDeleteRemix}
            hasSelectedRemix={selectedRemix !== null}
            remixName={selectedRemix?.name ?? null}
            remixDescription={selectedRemix?.description ?? null}
            feedbackTimestamp={feedbackTimestamp}
            remixType={selectedRemix?.remixType ?? "blockcode"}
            language={fileNameToLanguage(selectedFileName)}
            remixId={selectedRemix?.id ?? null}
            onCodeSaved={handleCodeSaved}
            canEdit={
              selectedRemix !== null &&
              (userId === creatorId || userId === selectedRemix.uploaderId)
            }
            canDelete={
              selectedRemix !== null &&
              (userId === creatorId || userId === selectedRemix.uploaderId)
            }
            isLoggedIn={!!userId}
            canUseAIFeedback={isCollaborator}
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
                  href={`/${selectedRemix.uploaderUsername}`}
                >
                  {selectedRemix.uploaderName}
                  <Link.Icon />
                </Link>
              </Card.Description>
            </Card.Header>
            <Card.Content className="flex flex-col gap-2">
              <ScrollShadow className="max-h-18">
                {selectedRemix.description}
              </ScrollShadow>
            </Card.Content>
          </Card>
        )}
      </div>
    </div>
  );
}
