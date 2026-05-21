import { verifySession } from "@/lib/dal";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import Remix from "@/models/Remix";
import mongoose from "mongoose";
import { notFound } from "next/navigation";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await verifySession();
  await connectDB();

  const project = await Project.findOne({
    _id: new mongoose.Types.ObjectId(id),
    creator: new mongoose.Types.ObjectId(session.userId),
  }).lean();

  if (!project) notFound();

  const remixes = await Remix.find({ project: project._id })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="w-full font-sans">
      <main className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-gray-400">{project.description}</p>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Remixes</h2>
          {remixes.length === 0 ? (
            <p className="text-sm text-gray-400">No remixes yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {remixes.map((remix) => (
                <li
                  key={remix._id.toString()}
                  className="flex flex-col gap-1 border border-gray-700 rounded-md p-3"
                >
                  <p className="text-sm">{remix.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(remix.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
