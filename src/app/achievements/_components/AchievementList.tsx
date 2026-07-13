"use client";

import { Button, Card, Chip, Separator } from "@heroui/react";
import {
  CheckCircleIcon,
  ClockIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

type Achievement = {
  id: string;
  name: string;
  description: string;
  progress: number;
  completed: boolean;
  unlockedAt?: string;
  points: number;
  tags?: string[];
};

function CompletedRow({ achievement }: { achievement: Achievement }) {
  return (
    <Card className="w-full items-stretch flex-row">
      <div className="flex flex-1 flex-col gap-3">
        <Card.Header>
          <Card.Title>{achievement.name}</Card.Title>
          <Card.Description>
            {achievement.description.length > 0
              ? achievement.description
              : "No description"}
          </Card.Description>
        </Card.Header>
        <Card.Footer>
          <div className="flex gap-1 flex-wrap">
            <Chip size="md">
              <CheckCircleIcon className="h-3.5 w-3.5 inline mr-1" />
              Unlocked
              {achievement.unlockedAt ? `: ${achievement.unlockedAt}` : ""}
            </Chip>
            <Chip size="md">{achievement.points} pts</Chip>

            {achievement.tags?.map((tag) => (
              <Chip key={tag} size="md" variant="secondary">
                {tag}
              </Chip>
            ))}
          </div>
        </Card.Footer>
      </div>
    </Card>
  );
}

function InProgressRow({
  achievement,
  onViewDetails,
}: {
  achievement: Achievement;
  onViewDetails: (id: string) => void;
}) {
  return (
    <Card className="w-full items-stretch flex-row">
      <div className="flex flex-1 flex-col gap-3">
        <Card.Header>
          <Card.Title>{achievement.name}</Card.Title>
          <Card.Description>
            {achievement.description.length > 0
              ? achievement.description
              : "No description"}
          </Card.Description>
        </Card.Header>
        <Card.Footer>
          <div className="flex gap-1 flex-wrap">
            <Chip size="md">
              <ClockIcon className="h-3.5 w-3.5 inline mr-1" />
              {achievement.progress}% complete
            </Chip>
            <Chip size="md">{achievement.points} pts</Chip>

            {achievement.tags?.map((tag) => (
              <Chip key={tag} size="md" variant="secondary">
                {tag}
              </Chip>
            ))}
          </div>
          <div className="flex gap-1 ml-auto shrink-0">
            <Button
              variant="outline"
              size="sm"
              onPress={() => onViewDetails(achievement.id)}
            >
              <TrophyIcon className="h-4 w-4" />
              Details
            </Button>
          </div>
        </Card.Footer>
      </div>
    </Card>
  );
}

export default function AchievementList({
  achievements,
}: {
  achievements: Achievement[];
}) {
  const router = useRouter();

  const completed = achievements.filter((a) => a.completed);
  const inProgress = achievements.filter((a) => !a.completed);

  function handleViewDetails(achievementId: string) {
    router.push(`/achievement/${achievementId}`);
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Completed</h1>
          {completed.length === 0 ? (
            <p className="text-sm text-gray-500">
              No achievements unlocked yet.
            </p>
          ) : (
            <p className="text-sm mt-0.5">Achievements you&apos;ve unlocked</p>
          )}
        </div>
        {completed.length > 0 &&
          completed.map((a) => <CompletedRow key={a.id} achievement={a} />)}
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">In Progress</h2>
          {inProgress.length === 0 ? (
            <p className="text-sm text-gray-500">
              You&apos;ve completed every achievement.
            </p>
          ) : (
            <p className="text-sm mt-0.5">
              Achievements you&apos;re still working toward
            </p>
          )}
        </div>
        {inProgress.length > 0 &&
          inProgress.map((a) => (
            <InProgressRow
              key={a.id}
              achievement={a}
              onViewDetails={handleViewDetails}
            />
          ))}
      </section>
    </div>
  );
}
