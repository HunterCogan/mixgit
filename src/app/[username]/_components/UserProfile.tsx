"use client";

import Link from "next/link";
import { Accordion, Avatar, Button, Card, Separator } from "@heroui/react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import UserProjectsList, { type UserProject } from "./UserProjectsList";

export default function UserProfile({
  name,
  username,
  color,
  imagePath,
  about,
  email,
  isOwner,
  projects,
  collaboratingProjects,
}: {
  name: string;
  username: string;
  color: string;
  imagePath: string | undefined;
  about: string;
  email: string | undefined;
  isOwner: boolean;
  projects: UserProject[];
  collaboratingProjects: UserProject[];
}) {
  const imageUrl = imagePath
    ? `https://scratchpad-profile-images.s3.us-east-1.amazonaws.com/${imagePath}`
    : undefined;
  const initial = name.substring(0, 2).toUpperCase();
  const aboutText = about.trim();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 font-sans">
      <div className="flex flex-col gap-8 md:flex-row">
        <Card
          variant="transparent"
          render={(props) => <aside {...props} />}
          className="flex flex-col gap-4 p-0 rounded-none overflow-visible md:w-72 w-full shrink-0 items-center"
        >
          <Avatar size="lg" className="h-48 w-48 rounded-full">
            <Avatar.Image src={imageUrl} alt={name} />
            <Avatar.Fallback
              style={{ backgroundColor: color }}
              className="text-4xl"
            >
              {initial}
            </Avatar.Fallback>
          </Avatar>

          <div className="flex flex-col text-center w-full max-w-full">
            <h1 className="text-2xl font-bold wrap-break-word">{name}</h1>
            <p className="text-lg text-default-500 wrap-break-word">
              @{username}
            </p>
            {email && (
              <p className="text-sm text-default-500 wrap-break-word">
                {email}
              </p>
            )}
          </div>

          {aboutText.length > 0 && (
            <p className="text-sm text-default-600 whitespace-pre-wrap">
              {aboutText}
            </p>
          )}

          {isOwner && (
            <Link href="/settings">
              <Button variant="outline" size="sm" className="w-full">
                <PencilSquareIcon className="h-4 w-4" />
                Edit profile
              </Button>
            </Link>
          )}
        </Card>

        <Separator
          orientation="vertical"
          className="hidden md:block self-stretch"
        />

        <div className="flex-1">
          <Accordion
            allowsMultipleExpanded
            defaultExpandedKeys={["projects", "collaborating"]}
            hideSeparator
            className="flex flex-col gap-3"
          >
            <Accordion.Item id="projects">
              <Accordion.Heading>
                <Accordion.Trigger className="text-lg font-semibold rounded-lg px-3 py-2 -mx-3">
                  Projects ({projects.length})
                  <Accordion.Indicator />
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body className="px-0">
                  <UserProjectsList
                    projects={projects}
                    username={username}
                    isOwner={isOwner}
                  />
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item id="collaborating">
              <Accordion.Heading>
                <Accordion.Trigger className="text-lg font-semibold rounded-lg px-3 py-2 -mx-3">
                  Collaborating on ({collaboratingProjects.length})
                  <Accordion.Indicator />
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body className="px-0">
                  <UserProjectsList
                    projects={collaboratingProjects}
                    username={username}
                    isOwner={isOwner}
                    emptyOwnerMessage="You're not collaborating on any projects yet. Ask a project owner to add you as a collaborator."
                    emptyMessage="Not a collaborator on any projects."
                  />
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
