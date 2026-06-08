import Link from "next/link";
import { Avatar, Button, Card, Separator } from "@heroui/react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import UserProjectsList, { type UserProject } from "./UserProjectsList";

export default function UserProfile({
  name,
  color,
  about,
  isOwner,
  userId,
  projects,
}: {
  name: string;
  color: string;
  about: string;
  isOwner: boolean;
  userId: string;
  projects: UserProject[];
}) {
  const initial = name.substring(0, 2).toUpperCase();
  const aboutText = about.trim();

  return (
    <div className="w-full font-sans">
      <main className="max-w-3xl mx-auto px-3 sm:px-6 py-8 flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <Avatar.Fallback style={{ backgroundColor: color }}>
                {initial}
              </Avatar.Fallback>
            </Avatar>
            <h1 className="text-2xl sm:text-2xl font-bold">{name}</h1>
          </div>
          {isOwner && (
            <Link href="/settings" className="shrink-0">
              <Button variant="outline" size="sm">
                <PencilSquareIcon className="h-4 w-4" />
                Edit
              </Button>
            </Link>
          )}
        </div>

        <Card>
          <Card.Header>
            <Card.Title className="text-lg font-semibold">About me</Card.Title>
          </Card.Header>
          <Card.Content>
            <p className="text-sm text-default-500 whitespace-pre-wrap">
              {aboutText.length > 0 ? aboutText : "No bio yet."}
            </p>
          </Card.Content>
        </Card>

        <Separator />

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Projects</h2>
          <UserProjectsList
            projects={projects}
            userId={userId}
            isOwner={isOwner}
          />
        </section>
      </main>
    </div>
  );
}
