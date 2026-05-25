import { verifySession } from "@/lib/dal";
import connectDB from "@/lib/db";
import ProjectModel from "@/models/Project";
import RemixModel, { type IProgramFile } from "@/models/Remix";
import UserModel from "@/models/User";
import mongoose from "mongoose";
import { notFound } from "next/navigation";
import { ProjectContent, type RemixItem } from "./_components/ProjectContent";
import { Avatar, Separator } from "@heroui/react";
import CreateRemixModal from "./_components/CreateRemixModal";
import { BackButton } from "../../../components/BackButton";
import AddCollaboratorModal from "./_components/AddCollaboratorModal";

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ projectId?: string }>;
}) {
  const { userId } = await params;
  const { projectId } = await searchParams;

  await verifySession();
  await connectDB();

  // populate the "name" field from each User object in team for displaying Avatars
  const project = await ProjectModel.findOne({
    _id: new mongoose.Types.ObjectId(projectId),
    creator: new mongoose.Types.ObjectId(userId),
  })
    .populate<{ team: { _id: mongoose.Types.ObjectId; name: string }[] }>(
      "team",
      "name",
    )
    .lean();

  if (!project) notFound();

  const creator = await UserModel.findById(userId).lean();

  // populate the "name" field for the uploader of each Remix to pass to ProjectContent, used for Avatars and displaying usernames
  const remixes = await RemixModel.find({ project: project._id })
    .sort({ createdAt: -1 })
    .populate<{
      uploader: { _id: mongoose.Types.ObjectId; name: string };
    }>("uploader", "name")
    .lean();

  // serialization to RemixItem needed since ProjectContent is a client component
  // currently, "asset" files are disregarded, with the "logic" file saved to projectJsonData
  const serializedRemixes: RemixItem[] = remixes.map((remix) => ({
    id: remix._id.toString(),
    name: remix.name,
    uploaderName: remix.uploader.name,
    description: remix.description,
    isMain: remix.isMain,
    projectJsonData:
      remix.files.find((f: IProgramFile) => f.fileType === "logic")?.data ?? "",
    createdAt: remix.createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }));

  return (
    <div className="font-sans h-screen flex flex-col overflow-hidden">
      <main className="px-6 py-8 flex flex-col gap-6 flex-1 min-h-0">
        <div className="flex flex-row gap-2 justify-between">
          <BackButton href="/dashboard" />
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-gray-400">{project.description}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2">
              <Avatar>
                <Avatar.Fallback>
                  {creator?.name?.substring(0, 2)}
                </Avatar.Fallback>
              </Avatar>
              {project.team.map((member) => (
                <Avatar key={member._id.toString()}>
                  <Avatar.Fallback>
                    {member.name.substring(0, 2)}
                  </Avatar.Fallback>
                </Avatar>
              ))}
              <AddCollaboratorModal projectId={project._id.toString()} />
            </div>
            <CreateRemixModal projectId={project._id.toString()} />
          </div>
        </div>
        <Separator></Separator>
        <ProjectContent remixes={serializedRemixes} />
      </main>
    </div>
  );
}
