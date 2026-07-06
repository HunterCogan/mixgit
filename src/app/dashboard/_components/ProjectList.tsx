"use client";

import { useRouter } from "next/navigation";
import {
  AlertDialog,
  Button,
  Card,
  Chip,
  Input,
  ListBox,
  Select,
  Spinner,
  useOverlayState,
} from "@heroui/react";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";

type Project = {
  id: string;
  name: string;
  slug: string;
  description: string;
  tags?: string[];
  createdAt: string;
  createdAtRaw: string;
};

// A List of all the projects for a user. Has View button which goes to the project page,
// and Delete button which opens a confirmation dialog before deleting the project.
function ProjectRow({
  project,
  username,
}: {
  project: Project;
  username: string;
}) {
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
            <Chip size="md">Created: {project.createdAt}</Chip>

            {project.tags?.map((tag) => (
              <Chip key={tag} size="md" variant="secondary">
                {tag}
              </Chip>
            ))}
          </div>
          <div className="flex gap-1 sm:ml-auto shrink-0">
            <Button
              variant="outline"
              size="sm"
              onPress={() => router.push(`/${username}/${project.slug}`)}
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
  username,
}: {
  projects: Project[];
  username: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const displayedProjects = useMemo(() => {
    const filtered = projects.filter((project) =>
      project.name.toLowerCase().startsWith(searchQuery.trim().toLowerCase()),
    );

    switch (sortBy) {
      case "oldest":
        return [...filtered].sort(
          (a, b) =>
            new Date(a.createdAtRaw).getTime() -
            new Date(b.createdAtRaw).getTime(),
        );

      case "name-asc":
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));

      case "name-desc":
        return [...filtered].sort((a, b) => b.name.localeCompare(a.name));

      case "newest":
      default:
        return [...filtered].sort(
          (a, b) =>
            new Date(b.createdAtRaw).getTime() -
            new Date(a.createdAtRaw).getTime(),
        );
    }
  }, [projects, searchQuery, sortBy]);

  if (projects.length === 0) {
    return (
      <p className="text-sm">No Projects yet. Create one to get started.</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />

        <Select
          value={sortBy}
          variant="secondary"
          onChange={(val) => setSortBy(String(val))}
          aria-label="Sort projects"
          className="sm:w-52"
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>

          <Select.Popover>
            <ListBox>
              <ListBox.Item id="newest" textValue="Newest">
                Newest
              </ListBox.Item>

              <ListBox.Item id="oldest" textValue="Oldest">
                Oldest
              </ListBox.Item>

              <ListBox.Item id="name-asc" textValue="Name (A-Z)">
                Name (A-Z)
              </ListBox.Item>

              <ListBox.Item id="name-desc" textValue="Name (Z-A)">
                Name (Z-A)
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      {displayedProjects.length === 0 ? (
        <p className="text-sm">No projects match your search.</p>
      ) : (
        displayedProjects.map((p) => (
          <ProjectRow key={p.id} project={p} username={username} />
        ))
      )}
    </div>
  );
}
