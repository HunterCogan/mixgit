import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import connectDB from "@/lib/db";
import ProjectModel from "@/models/Project";
import UserModel from "@/models/User";
import mongoose from "mongoose";
import UserProfile from "./_components/UserProfile";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const session = await verifySession();

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    notFound();
  }

  await connectDB();

  const user = await UserModel.findById(userId).lean();
  if (!user) {
    notFound();
  }

  const projects = await ProjectModel.find({
    creator: new mongoose.Types.ObjectId(userId),
  })
    .sort({ createdAt: -1 })
    .lean();

  const serializedProjects = projects.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    description: p.description ?? "",
    createdAt: new Date(p.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }));

  return (
    <UserProfile
      name={user.name}
      color={user.color ?? "#808080"}
      about={user.about ?? ""}
      isOwner={session.userId === userId}
      userId={userId}
      projects={serializedProjects}
    />
  );
}
