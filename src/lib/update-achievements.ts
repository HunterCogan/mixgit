"use server";

import { verifySession } from "@/lib/dal";
import connectDB from "@/lib/db";
import { ACHIEVEMENTS } from "@/models/Achievement";
import UserAchievement from "@/models/UserAchievement";
import mongoose from "mongoose";

export async function updateAchievementProgress(
  achievementName: string,
  currentValue: number,
) {
  const { userId } = await verifySession();

  const definition = ACHIEVEMENTS.find((a) => a.name === achievementName);
  if (!definition) {
    throw new Error(`Unknown achievement: ${achievementName}`);
  }

  await connectDB();

  const objectId = new mongoose.Types.ObjectId(userId);
  const wasAlreadyCompleted = await UserAchievement.exists({
    user: objectId,
    achievementName,
    completed: true,
  });

  const completed = currentValue >= definition.goal;
  const justCompleted = completed && !wasAlreadyCompleted;

  const updated = await UserAchievement.findOneAndUpdate(
    { user: objectId, achievementName },
    {
      $set: {
        currentValue,
        completed,
        ...(justCompleted ? { unlockedAt: new Date() } : {}),
      },
    },
    { upsert: true, new: true },
  );

  const progress = completed
    ? 100
    : Math.min(100, Math.round((currentValue / definition.goal) * 100));

  return {
    achievementName: updated.achievementName,
    currentValue: updated.currentValue,
    progress,
    completed: updated.completed,
    unlockedAt: updated.unlockedAt,
    justCompleted,
  };
}
