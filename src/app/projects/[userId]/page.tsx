import { verifySession } from "@/lib/dal";
import connectDB from "@/lib/db";
import ProjectModel from "@/models/Project";
import RemixModel, { type IProgramFile } from "@/models/Remix";
import UserModel from "@/models/User";
import mongoose from "mongoose";
import { notFound } from "next/navigation";
import { ProjectContent, type RemixItem } from "./_components/ProjectContent";
import { ProjectHeader } from "./_components/ProjectHeader";
import { Separator } from "@heroui/react";

function formatTimestamp(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ projectId?: string }>;
}) {
  const { userId } = await params;
  const { projectId } = await searchParams;

  const session = await verifySession();
  await connectDB();

  // populate the "name" field from each User object in team for displaying Avatars
  const project = await ProjectModel.findOne({
    _id: new mongoose.Types.ObjectId(projectId),
    creator: new mongoose.Types.ObjectId(userId),
  })
    .populate<{
      team: { _id: mongoose.Types.ObjectId; name: string; color: string }[];
    }>("team", "name color")
    .lean();

  if (!project) notFound();

  const creator = await UserModel.findById(userId).lean();

  // populate the "name" field for the uploader of each Remix to pass to ProjectContent, used for Avatars and displaying usernames
  const remixes = await RemixModel.find({ project: project._id })
    .sort({ createdAt: -1 })
    .populate<{
      uploader: { _id: mongoose.Types.ObjectId; name: string; color: string };
    }>("uploader", "name color")
    .lean();

  // serialization to RemixItem needed since ProjectContent is a client component
  // currently, "asset" files are disregarded, with the "logic" file saved to projectJsonData
  const serializedRemixes: RemixItem[] = remixes.map((remix) => ({
    id: remix._id.toString(),
    name: remix.name,
    uploaderName: remix.uploader?.name ?? "Unknown",
    uploaderColor: remix.uploader?.color ?? "#808080",
    uploaderId: remix.uploader?._id.toString()
      ? remix.uploader._id.toString()
      : remix._id.toString(),
    description: remix.description,
    isMain: remix.isMain,
    projectJsonData:
      remix.files.find((f: IProgramFile) => f.fileType === "logic")?.data ?? "",
    createdAt: formatTimestamp(remix.createdAt),
  }));

  return (
    <div className="font-sans h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden">
      <main className="px-3 sm:px-6 py-4 sm:py-8 flex flex-col gap-6 flex-1 min-h-0">
        <ProjectHeader
          projectId={project._id.toString()}
          creatorId={userId}
          userId={session.userId}
          initialName={project.name}
          initialDescription={project.description ?? ""}
          createdAt={project.createdAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          lastUpdated={formatTimestamp(project.updatedAt)}
          team={project.team.map((m) => ({
            id: m._id.toString(),
            name: m.name,
            color: m.color,
          }))}
          creatorName={creator?.name ?? ""}
          creatorColor={creator?.color ?? ""}
        />
        <Separator />
        <ProjectContent
          creatorId={userId}
          userId={session.userId}
          remixes={serializedRemixes}
        />
      </main>
    </div>
  );
}
