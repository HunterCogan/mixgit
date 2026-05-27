"use client";

import { Button, Card, Chip, Separator } from "@heroui/react";
import { EyeIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

type CollaboratingProject = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  ownerName: string;
  ownerId: string;
};

type SharingProject = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  teamCount: number;
};

function CollaboratingRow({ project }: { project: CollaboratingProject }) {
  const router = useRouter();

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
          <div className="flex gap-1">
            <Chip size="md">Owner: {project.ownerName}</Chip>
            <Chip size="md">Added: {project.createdAt}</Chip>
          </div>
          <div className="flex gap-1 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onPress={() =>
                router.push(
                  `/projects/${project.ownerId}?projectId=${project.id}`,
                )
              }
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

function SharingRow({
  project,
  userId,
}: {
  project: SharingProject;
  userId: string;
}) {
  const router = useRouter();

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
          <div className="flex gap-1">
            <Chip size="md">
              <UserGroupIcon className="h-3.5 w-3.5 inline mr-1" />
              {project.teamCount} collaborator
              {project.teamCount !== 1 ? "s" : ""}
            </Chip>
            <Chip size="md">Created: {project.createdAt}</Chip>
          </div>
          <div className="flex gap-1 ml-auto">
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
          </div>
        </Card.Footer>
      </div>
    </Card>
  );
}

export default function SharedProjectsList({
  collaborating,
  sharing,
  userId,
}: {
  collaborating: CollaboratingProject[];
  sharing: SharingProject[];
  userId: string;
}) {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Shared with Me</h2>
          <p className="text-sm mt-0.5">
            Projects you&apos;ve been added to as a collaborator
          </p>
        </div>
        {collaborating.length === 0 ? (
          <p className="text-sm">
            You haven&apos;t been added to any projects yet.
          </p>
        ) : (
          collaborating.map((p) => <CollaboratingRow key={p.id} project={p} />)
        )}
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-2xl font-semibold">My Shared Projects</h2>
          <p className="text-sm mt-0.5">
            Your projects that have collaborators
          </p>
        </div>
        {sharing.length === 0 ? (
          <p className="text-sm">
            You haven&apos;t shared any projects with others yet.
          </p>
        ) : (
          sharing.map((p) => (
            <SharingRow key={p.id} project={p} userId={userId} />
          ))
        )}
      </section>
    </div>
  );
}
