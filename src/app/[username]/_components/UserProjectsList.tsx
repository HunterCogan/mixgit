"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Chip, ListBox, Select } from "@heroui/react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

const VISIBLE_LIMIT = 4;

export type UserProject = {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  createdAtRaw: string;
  ownerUsername?: string;
};

function sortProjects(projects: UserProject[], sortBy: string) {
  switch (sortBy) {
    case "oldest":
      return [...projects].sort(
        (a, b) =>
          new Date(a.createdAtRaw).getTime() -
          new Date(b.createdAtRaw).getTime(),
      );

    case "name-asc":
      return [...projects].sort((a, b) => a.name.localeCompare(b.name));

    case "name-desc":
      return [...projects].sort((a, b) => b.name.localeCompare(a.name));

    case "newest":
    default:
      return [...projects].sort(
        (a, b) =>
          new Date(b.createdAtRaw).getTime() -
          new Date(a.createdAtRaw).getTime(),
      );
  }
}

function ProjectRow({
  project,
  username,
}: {
  project: UserProject;
  username: string;
}) {
  const router = useRouter();
  const ownerUsername = project.ownerUsername ?? username;

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
        <Card.Footer>
          <div className="flex gap-1 flex-wrap">
            <Chip size="md">Created: {project.createdAt}</Chip>
          </div>
          <div className="flex gap-1 ml-auto shrink-0">
            <Button
              variant="outline"
              size="sm"
              onPress={() => router.push(`/${ownerUsername}/${project.slug}`)}
            >
              <EyeIcon className="h-4 w-4" />
              View
            </Button>
          </div>
        </Card.Footer>
      </div>
    </Card>
  );
}

export default function UserProjectsList({
  projects,
  username,
  isOwner,
  emptyOwnerMessage = "No projects yet. Create one to get started.",
  emptyMessage = "No projects yet.",
}: {
  projects: UserProject[];
  username: string;
  isOwner: boolean;
  emptyOwnerMessage?: string;
  emptyMessage?: string;
}) {
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  const sortedProjects = useMemo(
    () => sortProjects(projects, sortBy),
    [projects, sortBy],
  );

  if (projects.length === 0) {
    return (
      <p className="text-sm text-default-500">
        {isOwner ? emptyOwnerMessage : emptyMessage}
      </p>
    );
  }

  const hasMore = sortedProjects.length > VISIBLE_LIMIT;
  const remainingCount = sortedProjects.length - VISIBLE_LIMIT;
  const visibleProjects = showAll
    ? sortedProjects
    : sortedProjects.slice(0, VISIBLE_LIMIT);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5 self-start text-sm text-default-500">
        <span>Sort:</span>

        <Select
          value={sortBy}
          onChange={(val) => setSortBy(String(val))}
          aria-label="Sort projects"
          className="w-auto"
        >
          <Select.Trigger className="min-h-0 border-none bg-transparent py-0 shadow-none font-medium text-foreground hover:bg-transparent">
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

      {visibleProjects.map((project) => (
        <ProjectRow key={project.id} project={project} username={username} />
      ))}

      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          className="self-start"
          onPress={() => setShowAll((prev) => !prev)}
        >
          {showAll ? (
            <>
              <ChevronUpIcon className="h-4 w-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDownIcon className="h-4 w-4" />
              Show {remainingCount} more
            </>
          )}
        </Button>
      )}
    </div>
  );
}
