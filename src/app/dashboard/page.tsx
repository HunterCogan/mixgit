import { verifySession } from "@/lib/dal";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import mongoose from "mongoose";
import ProjectList from "./_components/ProjectList";
import CreateProjectModal from "./_components/CreateProjectModal";

export default async function DashboardPage() {
  const session = await verifySession();

  await connectDB();
  const projects = await Project.find({
    creator: new mongoose.Types.ObjectId(session.userId),
  })
    .sort({ createdAt: -1 })
    .lean();

  const serialized = projects.map((p) => ({
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
    <div className="w-full font-sans">
      <main className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Your Scratchpad Projects</h1>
            <p className="text-sm mt-1">Create and manage your Projects</p>
          </div>
          <CreateProjectModal />
        </div>
        <ProjectList projects={serialized} />
      </main>
    </div>
  );
}
