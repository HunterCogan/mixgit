"use client";

import { useRouter } from "next/navigation";
import {
  AlertDialog,
  Button,
  Card,
  Chip,
  Spinner,
  useOverlayState,
} from "@heroui/react";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

type Project = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
};

// Shortens the project ID to look better (can be changed in the future)
function shortProjectId(id: string) {
  return id.slice(-8, -4) + "-" + id.slice(-4);
}

// A List of all the projects for a user. Has View button which goes to the project page,
// and Delete button which opens a confirmation dialog before deleting the project.
function ProjectRow({ project, userId }: { project: Project; userId: string }) {
  const router = useRouter();
  const deleteState = useOverlayState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        deleteState.close();
        router.refresh();
      } else {
        const data = await res.json();
        setError(
          typeof data.error === "string"
            ? data.error
            : "Failed to delete project",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full items-stretch flex-row">
      <div className="flex flex-1 flex-col gap-3">
        <Card.Header>
          <Card.Title>{project.name}</Card.Title>
          <Card.Description>
            {project.description.length > 0
              ? project.description
              : "No description"}
          </Card.Description>
        </Card.Header>
        <Card.Footer className="flex-col items-start gap-2 sm:flex-row sm:items-center">
          <div className="flex gap-1 flex-wrap">
            <Chip size="md">ID: {shortProjectId(project.id)}</Chip>
            <Chip size="md">Created: {project.createdAt}</Chip>
          </div>
          <div className="flex gap-1 sm:ml-auto shrink-0">
            <Button
              variant="outline"
              size="sm"
              onPress={() =>
                router.push(`/projects/${userId}?projectId=${project.id}`)
              }
            >
              <EyeIcon className="h-4 w-4" />
              View
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
                        Delete Project?
                      </AlertDialog.Heading>
                    </AlertDialog.Header>
                    <AlertDialog.Body>
                      <strong>{project.name}</strong> will be permanently
                      deleted. This cannot be undone.
                    </AlertDialog.Body>
                    <AlertDialog.Footer>
                      {error && <p className="text-sm text-red-500">{error}</p>}
                      <Button variant="outline" onPress={deleteState.close}>
                        Cancel
                      </Button>
                      <Button
                        variant="danger"
                        isDisabled={loading}
                        onPress={handleDelete}
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
        </Card.Footer>
      </div>
    </Card>
  );
}

export default function ProjectList({
  projects,
  userId,
}: {
  projects: Project[];
  userId: string;
}) {
  if (projects.length === 0) {
    return (
      <p className="text-sm">No Projects yet. Create one to get started.</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {projects.map((p) => (
        <ProjectRow key={p.id} project={p} userId={userId} />
      ))}
    </div>
  );
}
