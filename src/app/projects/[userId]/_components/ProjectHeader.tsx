"use client";

import { useRef, useState } from "react";
import {
  AlertDialog,
  Avatar,
  Button,
  ButtonGroup,
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
  UserMinusIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { ProjectSchema } from "@/lib/schemas/project.zod";

interface TeamMember {
  id: string;
  name: string;
  color: string;
}

interface ProjectHeaderProps {
  projectId: string;
  creatorId: string;
  userId: string;
  initialName: string;
  initialDescription: string;
  createdAt: string;
  lastUpdated: string | undefined;
  team: TeamMember[];
  creatorName: string;
  creatorColor: string;
}

export function ProjectHeader({
  projectId,
  creatorId,
  userId,
  initialName,
  initialDescription,
  createdAt,
  lastUpdated,
  team,
  creatorName,
  creatorColor,
}: ProjectHeaderProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [loading, setLoading] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const savedRef = useRef({
    name: initialName,
    description: initialDescription,
  });

  const leaveState = useOverlayState();

  // Creates a copy of team where project creator is sortedTeam[0] and session user is sortedTeam[1]
  const sortedTeam = [
    { id: creatorId, name: creatorName, color: creatorColor },
    ...[...team]
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
        savedRef.current = { name, description };
      } else {
        const { error } = await res.json().catch(() => ({}));
        setSaveError(typeof error === "string" ? error : "Failed to save");
      }
    } catch {
      setSaveError("Failed to save");
    }
  }

  async function handleLeaveProject() {
    setLoading(true);
    try {
      // TODO: implement when UPDATE route is ready
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
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:items-end">
        <div className="flex justify-between items-end">
          <div className="flex -space-x-2">
            {sortedTeam.slice(0, 3).map((member) => (
              <Link
                key={member.id}
                target="_blank"
                href={`/users/${member.id}`}
              >
                <Tooltip delay={0}>
                  <Tooltip.Trigger>
                    <Avatar className="ring-2 ring-white">
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
                <Dropdown.Trigger>
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
                          href={`/users/${member.id}`}
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
            <CreateRemixModal
              projectId={projectId}
              creatorId={creatorId}
            ></CreateRemixModal>
            <ButtonGroup>
              <AddCollaboratorModal
                projectId={projectId}
                isDisabled={userId !== creatorId}
                teamIds={[creatorId, ...team.map((m) => m.id)]}
              />
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
                            <strong>{name}</strong> will be permanently deleted.
                            This cannot be undone.
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
                        <Button variant="tertiary" onPress={leaveState.close}>
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
            </ButtonGroup>
          </div>
        )}
      </div>
    </Surface>
  );
}
