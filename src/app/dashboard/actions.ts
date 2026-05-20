"use server";

import { verifySession } from "@/lib/dal";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import mongoose from "mongoose";

export async function handleDeleteProject(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  if (!projectId) return;

  const session = await verifySession();
  await connectDB();

  await Project.deleteOne({
    _id: new mongoose.Types.ObjectId(projectId),
    creator: new mongoose.Types.ObjectId(session.userId),
  });

  redirect("/dashboard");
}
