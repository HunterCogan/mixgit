"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UsersIcon } from "@heroicons/react/24/outline";
import { Button, Modal, useOverlayState } from "@heroui/react";
import UserSearch, { type UserResult } from "./UserSearch";

interface Props {
  projectId: string;
  creatorId: string;
  isDisabled: boolean;
  teamIds: string[];
  onMemberAdded: (member: { id: string; name: string; color: string }) => void;
  onMemberRemoved: (memberId: string) => void;
}

export default function AddCollaboratorModal({
  projectId,
  creatorId,
  isDisabled,
  teamIds,
  onMemberAdded,
  onMemberRemoved,
}: Props) {
  const router = useRouter();
  const state = useOverlayState();
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const allTeamIds = [...teamIds, ...addedIds].filter(
    (id) => !removedIds.includes(id),
  );

  function handleClose() {
    state.setOpen(false);
    router.refresh();
  }

  async function handleAdd(user: UserResult) {
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Failed to add collaborator",
        );
      }

      setAddedIds((prev) => [...prev, user.id]);
      setRemovedIds((prev) => prev.filter((id) => id !== user.id));
      onMemberAdded({ id: user.id, name: user.name, color: "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add collaborator");
    }
  }

  async function handleRemove(user: UserResult) {
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/team`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Failed to remove collaborator",
        );
      }

      setRemovedIds((prev) => [...prev, user.id]);
      setAddedIds((prev) => prev.filter((id) => id !== user.id));
      onMemberRemoved(user.id);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to remove collaborator",
      );
    }
  }

  return (
    <Modal state={state}>
      <Button isIconOnly isDisabled={isDisabled} variant="secondary" size="sm">
        <UsersIcon />
      </Button>
      <Modal.Backdrop>
        <Modal.Container size="md">
          <Modal.Dialog>
            <Modal.CloseTrigger onPress={handleClose} />
            <Modal.Header>
              <Modal.Heading className="px-1">
                Manage Collaborators
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="max-h-96 overflow-y-auto">
                <UserSearch
                  teamIds={allTeamIds}
                  creatorId={creatorId}
                  onAdd={handleAdd}
                  onRemove={handleRemove}
                />
              </div>
              {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
