"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import { Button, Modal, useOverlayState } from "@heroui/react";
import UserSearch, { type UserResult } from "./UserSearch";

interface Props {
  projectId: string;
  isDisabled: boolean;
  teamIds: string[];
}

export default function AddCollaboratorModal({
  projectId,
  isDisabled,
  teamIds,
}: Props) {
  const router = useRouter();
  const state = useOverlayState();
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const allTeamIds = [...teamIds, ...addedIds];

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
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add collaborator");
    }
  }

  return (
    <Modal state={state}>
      <Button isIconOnly isDisabled={isDisabled} variant="secondary" size="sm">
        <UserPlusIcon />
      </Button>
      <Modal.Backdrop>
        <Modal.Container size="md">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="px-1">Add Collaborator</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="max-h-96 overflow-y-auto">
                <UserSearch teamIds={allTeamIds} onAdd={handleAdd} />
              </div>
              {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
