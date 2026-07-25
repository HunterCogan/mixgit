import { verifySession } from "@/lib/dal";
import connectDB from "@/lib/db";
import { ACHIEVEMENTS } from "@/models/Achievement";
import UserAchievement, { IUserAchievement } from "@/models/UserAchievement";
import mongoose from "mongoose";
import AchievementList from "./_components/AchievementList";

export default async function AchievementsPage() {
  const { userId } = await verifySession();
  await connectDB();

  const objectId = new mongoose.Types.ObjectId(userId);

  const userProgressRaw = await UserAchievement.find({
    user: objectId,
  }).lean<IUserAchievement[]>();

  const progressByName = new Map(
    userProgressRaw.map((up) => [up.achievementName.toString(), up]),
  );

  const achievements = ACHIEVEMENTS.map((a) => {
    const userProgress = progressByName.get(a.name);
    const currentValue = userProgress?.currentValue ?? 0;
    const completed = userProgress?.completed ?? false;

    const progress = completed
      ? 100
      : Math.min(100, Math.round((currentValue / a.goal) * 100));

    return {
      id: a.name,
      name: a.name,
      description: a.description,
      goal: a.goal,
      progress,
      completed,
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
      <main className="max-w-5xl mx-auto px-3 sm:px-6 py-8 flex flex-col gap-6">
        <AchievementList achievements={achievements} />
      </main>
    </div>
  );
}
