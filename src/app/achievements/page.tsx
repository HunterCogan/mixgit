import { verifySession } from "@/lib/dal";
import connectDB from "@/lib/db";
import UserAchievement from "@/models/UserAchievement";
import mongoose from "mongoose";
import AchievementList from "./_components/AchievementList";
import Achievement from "@/models/Achievement";

type AchievementDefinition = {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  points: number;
  tags?: string[];
};

type UserAchievementResult = {
  achievement: mongoose.Types.ObjectId | string;
  progress: number;
  completed: boolean;
  unlockedAt?: Date;
};

export default async function AchievementsPage() {
  const { userId } = await verifySession();
  await connectDB();

  const objectId = new mongoose.Types.ObjectId(userId);

  const [definitions, userProgressRaw] = await Promise.all([
    Achievement.find().sort({ createdAt: 1 }).lean<AchievementDefinition[]>(),
    UserAchievement.find({ user: objectId }).lean<UserAchievementResult[]>(),
  ]);

  const progressByAchievementId = new Map(
    userProgressRaw.map((up) => [up.achievement.toString(), up]),
  );

  const achievements = definitions.map((def) => {
    const userProgress = progressByAchievementId.get(def._id.toString());

    return {
      id: def._id.toString(),
      name: def.name,
      description: def.description ?? "",
      points: def.points ?? 0,
      tags: def.tags ?? [],
      progress: userProgress?.progress ?? 0,
      completed: userProgress?.completed ?? false,
      unlockedAt: userProgress?.unlockedAt
        ? new Date(userProgress.unlockedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : undefined,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <main className="max-w-3xl mx-auto px-3 sm:px-6 py-8 flex flex-col gap-6">
        <AchievementList achievements={achievements} />
      </main>
    </div>
  );
}
