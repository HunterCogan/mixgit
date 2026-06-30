"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  Avatar,
  Button,
  ButtonGroup,
  Chip,
  Dropdown,
  FieldError,
  Header,
  Input,
  Popover,
  Spinner,
  Surface,
  TextArea,
  TextField,
  Tooltip,
  useOverlayState,
} from "@heroui/react";
import AddCollaboratorModal from "./AddCollaboratorModal";
import CreateRemixModal from "./CreateRemixModal";
import {
  InformationCircleIcon,
  TagIcon,
  UserMinusIcon,
  MinusCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { ProjectSchema, PROJECT_TAGS } from "@/lib/schemas/project.zod";

interface TeamMember {
  id: string;
  name: string;
  username?: string;
  color: string;
  imagePath?: string;
}

interface ProjectHeaderProps {
  projectId: string;
  creatorId: string;
  creatorUsername: string;
  slug: string;
  userId: string | undefined;
  initialName: string;
  initialDescription: string;
  createdAt: string;
  lastUpdated: string | undefined;
  team: TeamMember[];
  creatorName: string;
  creatorColor: string;
  creatorImagePath?: string;
  tags: string[];
}

export function ProjectHeader({
  projectId,
  creatorId,
  creatorUsername,
  slug,
  userId,
  initialName,
  initialDescription,
  createdAt,
  lastUpdated,
  team,
  creatorName,
  creatorColor,
  creatorImagePath,
  tags: initialTags,
}: ProjectHeaderProps) {
  const [tags, setTags] = useState(initialTags);
  const [name, setName] = useState(initialName);
  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
  const [description, setDescription] = useState(initialDescription);
  const [loading, setLoading] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const router = useRouter();
  const savedRef = useRef({
    name: initialName,
    description: initialDescription,
  });
  const [addedMembers, setAddedMembers] = useState<TeamMember[]>([]);
  const [removedMemberIds, setRemovedMemberIds] = useState<string[]>([]);

  const leaveState = useOverlayState();

  const liveTeam = [
    ...team.filter((m) => !removedMemberIds.includes(m.id)),
    ...addedMembers.filter((m) => !team.some((t) => t.id === m.id)),
  ];

  // Creates a copy of team where project creator is sortedTeam[0] and session user is sortedTeam[1]
  const sortedTeam = [
    {
      id: creatorId,
      name: creatorName,
      username: creatorUsername,
      color: creatorColor,
      imagePath: creatorImagePath,
    },
    ...[...liveTeam]
      .filter((m) => m.id !== creatorId)
      .sort((a) => (a.id === userId ? -1 : 0)),
  ];

  const isVisitor = !sortedTeam.some((m) => m.id === userId);

  async function handleSave() {
    const nameResult = ProjectSchema.shape.name.safeParse(name);
    const descResult = ProjectSchema.shape.description.safeParse(
      description || undefined,
    );

    if (!nameResult.success || !descResult.success) return;
    if (
      name === savedRef.current.name &&
      description === savedRef.current.description
    )
      return;

    setSaveError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (res.ok) {
        const data = await res.json();
        savedRef.current = { name, description };

        if (data.slug && data.slug !== slug) {
          router.push(`/${creatorUsername}/${data.slug}`);
        }
      } else {
        const { error } = await res.json().catch(() => ({}));
        setSaveError(typeof error === "string" ? error : "Failed to save");
        setName(savedRef.current.name);
      }
    } catch {
      setSaveError("Failed to save");
    }
  }

  async function updateTags(updatedTags: string[]) {
    const previous = tags;

    setTags(updatedTags);

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          tags: updatedTags,
        }),
      });

      if (!res.ok) {
        setTags(previous);
      }
    } catch {
      setTags(previous);
    }
  }

  function handleMemberAdded(member: TeamMember) {
    setAddedMembers((prev) => [...prev, member]);
    setRemovedMemberIds((prev) => prev.filter((id) => id !== member.id));
  }

  function handleMemberRemoved(memberId: string) {
    setRemovedMemberIds((prev) => [...prev, memberId]);
    setAddedMembers((prev) => prev.filter((m) => m.id !== memberId));
  }

  async function handleLeaveProject() {
    if (!userId) return;
    setLoading(true);
    setLeaveError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/team/leave`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Failed to leave project",
        );
      }

      handleMemberRemoved(userId);
      leaveState.setOpen(false);
      router.refresh();
    } catch (e) {
      setLeaveError(e instanceof Error ? e.message : "Failed to leave project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Surface className="flex flex-col sm:flex-row sm:justify-between rounded-2xl sm:rounded-3xl p-4 sm:p-6 gap-4">
      <div className="flex flex-row flex-1 gap-4 sm:gap-6">
        <div className="flex flex-col flex-1 gap-1 min-w-0">
          <TextField
            aria-label="Project name"
            isRequired
            isReadOnly={userId !== creatorId}
            value={name}
            onChange={setName}
            onBlur={handleSave}
            validationBehavior="aria"
            validate={(value) => {
              if (!value) return "Project name is required";
              const result = ProjectSchema.shape.name.safeParse(value);
              return result.success ? null : result.error.issues[0].message;
            }}
          >
            <Input className="bg-transparent border-none shadow-none rounded-sm text-2xl font-bold p-1" />
            <FieldError />
          </TextField>
          <TextField
            aria-label="Project description"
            isReadOnly={userId !== creatorId}
            value={description}
            onChange={setDescription}
            onBlur={handleSave}
            validationBehavior="aria"
            validate={(value) => {
              if (!value) return null;
              const result = ProjectSchema.shape.description.safeParse(value);
              return result.success
                ? null
                : (result.error.issues[0]?.message ?? null);
            }}
          >
            <TextArea className="resize-none bg-transparent border-none shadow-none rounded-sm text-sm p-1" />
            <FieldError />
          </TextField>
          {saveError && (
            <p className="text-xs text-red-500 px-1">{saveError}</p>
          )}

          <div className="flex flex-wrap gap-1 px-1">
            {tags.map((tag) => (
              <Chip key={tag} size="md" variant="secondary">
                <Chip.Label>{tag}</Chip.Label>

                {userId === creatorId && (
                  <Button
                    isIconOnly
                    variant="tertiary"
                    size="md"
                    className="h-4! w-4! min-h-0! my-0"
                    onPress={() =>
                      void updateTags(tags.filter((t) => t !== tag))
                    }
                    aria-label={`Remove ${tag}`}
                  >
                    <MinusCircleIcon className="h-4 w-4 text-gray-600" />
                  </Button>
                )}
              </Chip>
            ))}

            {userId === creatorId && tags.length < 3 && (
              <Dropdown isOpen={isTagMenuOpen} onOpenChange={setIsTagMenuOpen}>
                <Dropdown.Trigger className="flex items-center">
                  <Chip
                    size="md"
                    variant="secondary"
                    className="cursor-pointer h-6"
                  >
                    <Chip.Label>Add Tag</Chip.Label>
                    <TagIcon width={16} />
                  </Chip>
                </Dropdown.Trigger>

                <Dropdown.Popover>
                  <Dropdown.Menu>
                    <Dropdown.Section>
                      <Header>Select a tag</Header>

                      {PROJECT_TAGS.filter((tag) => !tags.includes(tag)).map(
                        (tag) => (
                          <Dropdown.Item
                            key={tag}
                            onAction={() => {
                              setIsTagMenuOpen(false);
                              void updateTags([...tags, tag]);
                            }}
                          >
                            {tag}
                          </Dropdown.Item>
                        ),
                      )}
                    </Dropdown.Section>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:items-end">
        <div className="flex justify-between items-end">
          <div className="flex -space-x-2">
            {sortedTeam.slice(0, 3).map((member) => (
              <Link
                key={member.id}
                target="_blank"
                href={`/${member.username ?? member.id}`}
              >
                <Tooltip delay={0}>
                  <Tooltip.Trigger tabIndex={0}>
                    <Avatar className="ring-2 ring-white">
                      {member.imagePath && (
                        <Avatar.Image
                          src={`https://scratchpad-profile-images.s3.us-east-1.amazonaws.com/${member.imagePath}`}
                          alt={member.name}
                        />
                      )}

                      <Avatar.Fallback
                        className="select-none"
                        style={{ backgroundColor: member.color }}
                      >
                        {member.name.substring(0, 2).toUpperCase()}
                      </Avatar.Fallback>
                    </Avatar>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <p>{member.name}</p>
                  </Tooltip.Content>
                </Tooltip>
              </Link>
            ))}
            {sortedTeam.length - 3 > 0 && (
              <Dropdown>
                <Dropdown.Trigger className="flex">
                  <Avatar className="ring-2 ring-white">
                    <Avatar.Fallback className="text-xs select-none">
                      +{sortedTeam.length - 3}
                    </Avatar.Fallback>
                  </Avatar>
                </Dropdown.Trigger>
                <Dropdown.Popover>
                  <Dropdown.Menu>
                    <Dropdown.Section>
                      <Header>Other Members</Header>
                      {sortedTeam.slice(3).map((member) => (
                        <Dropdown.Item
                          key={member.id}
                          target="_blank"
                          href={`/${member.username ?? member.id}`}
                        >
                          {member.name}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Section>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            )}
          </div>
          <Popover>
            <Popover.Trigger className="self-start">
              <InformationCircleIcon className="w-4 h-4" />
            </Popover.Trigger>
            <Popover.Content>
              <Popover.Dialog>
                <Popover.Arrow />
                <Popover.Heading>About this Project</Popover.Heading>
                <p className="text-xs text-muted mt-1">
                  Created by <strong>{creatorName}</strong> on {createdAt}.{" "}
                  <br />
                  Updated {lastUpdated}.
                </p>
              </Popover.Dialog>
            </Popover.Content>
          </Popover>
        </div>
        {!isVisitor && (
          <div className="flex justify-between items-end gap-1">
            <CreateRemixModal projectId={projectId} creatorId={creatorId} />

            <div className="flex items-center gap-1">
              <ButtonGroup>
                {userId === creatorId && (
                  <AddCollaboratorModal
                    projectId={projectId}
                    creatorId={creatorId}
                    isDisabled={userId !== creatorId}
                    teamIds={[creatorId, ...liveTeam.map((m) => m.id)]}
                    onMemberAdded={handleMemberAdded}
                    onMemberRemoved={handleMemberRemoved}
                  />
                )}

                {userId !== creatorId && (
                  <AlertDialog
                    isOpen={leaveState.isOpen}
                    onOpenChange={leaveState.setOpen}
                  >
                    <Button
                      isIconOnly
                      onPress={leaveState.open}
                      variant="secondary"
                      size="sm"
                    >
                      <ButtonGroup.Separator />
                      <UserMinusIcon />
                    </Button>

                    <AlertDialog.Backdrop>
                      <AlertDialog.Container>
                        <AlertDialog.Dialog>
                          <AlertDialog.CloseTrigger className="m-3" />

                          <AlertDialog.Header>
                            <AlertDialog.Heading className="flex items-center gap-2 text-2xl mb-3">
                              <AlertDialog.Icon />
                              Leave Project?
                            </AlertDialog.Heading>
                          </AlertDialog.Header>

                          <AlertDialog.Body>
                            {team.length === 0 ? (
                              <p>
                                <strong>{name}</strong> will be permanently
                                deleted. This cannot be undone.
                              </p>
                            ) : (
                              <p>
                                You will no longer be able to contribute to this
                                project.
                              </p>
                            )}

                            {leaveError && (
                              <p className="text-red-500 text-sm mt-2">
                                {leaveError}
                              </p>
                            )}
                          </AlertDialog.Body>

                          <AlertDialog.Footer>
                            <Button
                              variant="tertiary"
                              onPress={leaveState.close}
                            >
                              Cancel
                            </Button>

                            <Button
                              variant="danger"
                              isDisabled={loading}
                              onPress={handleLeaveProject}
                            >
                              {loading && <Spinner size="sm" />}
                              {loading ? "Leaving..." : "Leave"}
                            </Button>
                          </AlertDialog.Footer>
                        </AlertDialog.Dialog>
                      </AlertDialog.Container>
                    </AlertDialog.Backdrop>
                  </AlertDialog>
                )}
              </ButtonGroup>
            </div>
          </div>
        )}
      </div>
    </Surface>
  );
}
