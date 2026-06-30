import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import connectDB from "@/lib/db";
import ProjectModel from "@/models/Project";
import RemixModel, { type IProgramFile } from "@/models/Remix";
import UserModel from "@/models/User";
import { redirect } from "next/navigation";
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
}: {
  params: Promise<{ username: string; projectSlug: string }>;
}) {
  const { username, projectSlug } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  await connectDB();

  const homePage = session?.session?.userId ? "dashboard" : "";

  const creator = await UserModel.findOne({ username }).lean();
  if (!creator) redirect(`/${homePage}?error=invalid-user`);

  const project = await ProjectModel.findOne({
    creator: creator._id,
    slug: projectSlug,
  })
    .populate<{
      team: {
        _id: import("mongoose").Types.ObjectId;
        name: string;
        username?: string;
        color: string;
        imagePath?: string | null;
      }[];
    }>("team", "name username color imagePath")
    .lean();

  if (!project) redirect(`/${homePage}?error=project-not-found`);

  const userId = session?.user?.id;

  const isOwner = userId && project.creator.toString() === userId;

  const isCollaborator =
    userId && project.team.some((member) => member._id.toString() === userId);

  const canView = project.visibility === "public" || isOwner || isCollaborator;

  if (!canView) {
    redirect(`/${homePage}?error=access-denied`);
  }

  const remixes = await RemixModel.find({ project: project._id })
    .sort({ createdAt: -1 })
    .populate<{
      uploader: {
        _id: import("mongoose").Types.ObjectId;
        name: string;
        username: string;
        color: string;
        imagePath?: string | null;
      };
    }>("uploader", "name username color imagePath")
    .lean();

  const serializedRemixes: RemixItem[] = remixes.map((remix) => ({
    id: remix._id.toString(),
    name: remix.name,
    uploaderName: remix.uploader?.name ?? "Unknown",
    uploaderUsername: remix.uploader?.username ?? "",
    uploaderColor: remix.uploader?.color ?? "#808080",
    uploaderImagePath: remix.uploader?.imagePath ?? undefined,
    uploaderId: remix.uploader?._id.toString()
      ? remix.uploader._id.toString()
      : remix._id.toString(),
    description: remix.description,
    isMain: remix.isMain,
    projectJsonData:
      remix.files.find((f: IProgramFile) => f.fileType === "logic")?.data ?? "",
    createdAt: formatTimestamp(remix.createdAt),
  }));

  const creatorId = creator._id.toString();

  return (
    <div className="font-sans h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden">
      <main className="px-3 sm:px-6 py-4 sm:py-8 flex flex-col gap-6 flex-1 min-h-0">
        <ProjectHeader
          projectId={project._id.toString()}
          creatorId={creatorId}
          userId={session?.user?.id}
          initialName={project.name}
          initialDescription={project.description ?? ""}
          tags={project.tags ?? []}
          createdAt={project.createdAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          lastUpdated={formatTimestamp(project.updatedAt)}
          team={project.team.map((m) => ({
            id: m._id.toString(),
            name: m.name,
            username: m.username,
            color: m.color,
            imagePath: m.imagePath ?? undefined,
          }))}
          creatorName={creator.name ?? ""}
          creatorUsername={creator.username ?? ""}
          slug={project.slug}
          creatorColor={creator.color ?? ""}
          creatorImagePath={creator.imagePath ?? undefined}
          initialVisibility={project.visibility}
        />
        <Separator />
        <ProjectContent
          creatorId={creatorId}
          userId={session?.user?.id}
          remixes={serializedRemixes}
          visibility={project.visibility}
          projectId={project._id.toString()}
        />
      </main>
    </div>
  );
}
