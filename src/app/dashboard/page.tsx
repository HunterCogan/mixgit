import { verifySession } from "@/lib/dal";
import connectDB from "@/lib/db";
import ProjectModel from "@/models/Project";
import UserModel from "@/models/User";
import mongoose from "mongoose";
import ProjectList from "./_components/ProjectList";
import CreateProjectModal from "./_components/CreateProjectModal";

export default async function DashboardPage() {
  const session = await verifySession();

  await connectDB();

  const user = await UserModel.findById(session.userId).lean();

  const projects = await ProjectModel.find({
    creator: new mongoose.Types.ObjectId(session.userId),
  })
    .sort({ createdAt: -1 })
    .lean();

  const serialized = projects.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    tags: p.tags ?? [],
    createdAt: new Date(p.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    createdAtRaw: p.createdAt.toISOString(),
  }));

  return (
    <div className="w-full font-sans">
      <main className="max-w-3xl mx-auto px-3 sm:px-6 py-8 flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              Your MixGit Projects
            </h1>
            <p className="text-sm mt-1">Create and manage your Projects</p>
          </div>
          <CreateProjectModal />
        </div>
        <ProjectList
          projects={serialized}
          username={user?.username ?? session.userId}
        />
      </main>
    </div>
  );
}
