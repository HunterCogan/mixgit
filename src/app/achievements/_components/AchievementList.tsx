"use client";

import { Button, Card, Chip, Separator, toast } from "@heroui/react";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { updateAchievementProgress } from "@/lib/update-achievements";

type Achievement = {
  id: string;
  name: string;
  description: string;
  progress: number;
  completed: boolean;
  unlockedAt?: string;
  goal: number;
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
          </div>
        </Card.Footer>
      </div>
    </Card>
  );
}

function InProgressRow({
  achievement,
  onUpdateProgress,
}: {
  achievement: Achievement;
  onUpdateProgress: (achievementName: string, currentValue: number) => void;
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
  const [achievementState, setAchievementState] =
    useState<Achievement[]>(achievements);

  async function handleUpdateProgress(
    achievementName: string,
    currentValue: number,
  ) {
    try {
      const data = await updateAchievementProgress(
        achievementName,
        currentValue,
      );

      if (data.justCompleted) {
        toast.success("Achievement unlocked!", {
          description: achievementName,
        });
      }

      setAchievementState((prev) =>
        prev.map((a) =>
          a.name === achievementName
            ? {
                ...a,
                progress: data.progress,
                completed: data.completed,
                unlockedAt: data.unlockedAt
                  ? new Date(data.unlockedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : a.unlockedAt,
              }
            : a,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  }

  const completed = achievementState.filter((a) => a.completed);
  const inProgress = achievementState.filter((a) => !a.completed);

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
              onUpdateProgress={handleUpdateProgress}
            />
          ))}
      </section>
    </div>
  );
}
