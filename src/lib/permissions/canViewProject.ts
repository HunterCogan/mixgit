import { Types } from "mongoose";

type ProjectPermission = {
  creator: Types.ObjectId;
  visibility: "public" | "private";
  team?: Types.ObjectId[];
};

export function canViewProject(
  userId: string | undefined,
  project: ProjectPermission,
) {
  if (project.visibility === "public") {
    return true;
  }

  if (!userId) {
    return false;
  }

  const isOwner = project.creator.toString() === userId;

  const isCollaborator =
    project.team?.some((member) => member.toString() === userId) ?? false;

  return isOwner || isCollaborator;
}
