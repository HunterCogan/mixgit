import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import connectDB from "@/lib/db";
import ProjectModel from "@/models/Project";
import UserModel from "@/models/User";
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

  const [projects, collaboratingProjects] = await Promise.all([
    ProjectModel.find({ creator: user._id }).sort({ createdAt: -1 }).lean(),
    ProjectModel.find({ team: user._id, creator: { $ne: user._id } })
      .sort({ createdAt: -1 })
      .populate<{ creator: { username: string } }>("creator", "username")
      .lean(),
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
    createdAt: formatDate(p.createdAt),
    createdAtRaw: p.createdAt.toISOString(),
  }));

  const serializedCollaboratingProjects = collaboratingProjects.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    createdAt: formatDate(p.createdAt),
    createdAtRaw: p.createdAt.toISOString(),
    ownerUsername: p.creator.username,
  }));

  const isOwner = session?.user?.id === userId;

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
    />
  );
}
