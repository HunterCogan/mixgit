import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import connectDB from "@/lib/db";
import ProjectModel from "@/models/Project";
import UserModel from "@/models/User";
import { ACHIEVEMENTS } from "@/models/Achievement";
import UserAchievement, { IUserAchievement } from "@/models/UserAchievement";
import UserProfile from "./_components/UserProfile";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  await connectDB();

  const user = await UserModel.findOne({ username }).lean();
  if (!user) {
    notFound();
  }

  const userId = user._id.toString();
  const isOwner = session?.user?.id === userId;
  const viewerObjectId = session?.user?.id;

  const viewerId = viewerObjectId;

  const visibilityFilter = (userId: string) => ({
    $or: [
      { visibility: "public" as const },
      { visibility: { $exists: false } },
      {
        visibility: "private" as const,
        $or: [{ creator: userId }, { team: userId }],
      },
    ],
  });

  const [projects, collaboratingProjects, userAchievementsRaw] =
    await Promise.all([
      // user's own projects

      ProjectModel.find(
        isOwner
          ? {
              creator: user._id,
            }
          : viewerId
            ? {
                creator: user._id,
                ...visibilityFilter(viewerId),
              }
            : {
                creator: user._id,
                $or: [
                  { visibility: "public" as const },
                  { visibility: { $exists: false } },
                ],
              },
      )
        .sort({ createdAt: -1 })
        .lean(),

      // collaborating projects

      ProjectModel.find(
        isOwner
          ? {
              team: user._id,
              creator: { $ne: user._id },
            }
          : viewerId
            ? {
                team: user._id,
                creator: { $ne: user._id },
                ...visibilityFilter(viewerId),
              }
            : {
                team: user._id,
                creator: { $ne: user._id },
                $or: [
                  { visibility: "public" as const },
                  { visibility: { $exists: false } },
                ],
              },
      )
        .sort({ createdAt: -1 })
        .populate<{ creator: { username: string } }>("creator", "username")
        .lean(),

      UserAchievement.find({
        user: user._id,
      }).lean<IUserAchievement[]>(),
    ]);

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const serializedProjects = projects.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    visibility: p.visibility,
    tags: p.tags ?? [],
    createdAt: formatDate(p.createdAt),
    createdAtRaw: p.createdAt.toISOString(),
  }));

  const serializedCollaboratingProjects = collaboratingProjects.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    visibility: p.visibility,
    createdAt: formatDate(p.createdAt),
    createdAtRaw: p.createdAt.toISOString(),
    ownerUsername: p.creator.username,
  }));

  const progressByName = new Map(
    userAchievementsRaw.map((ua) => [ua.achievementName, ua]),
  );

  const serializedAchievements = ACHIEVEMENTS.map((a) => {
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
        ? formatDate(userProgress.unlockedAt)
        : undefined,
    };
  });

  return (
    <UserProfile
      name={user.name}
      username={user.username}
      color={user.color ?? "#808080"}
      imagePath={user.imagePath ?? undefined}
      about={user.about ?? ""}
      email={isOwner ? user.email : undefined}
      isOwner={isOwner}
      projects={serializedProjects}
      collaboratingProjects={serializedCollaboratingProjects}
      achievements={serializedAchievements}
    />
  );
}
