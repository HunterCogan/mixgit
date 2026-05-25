"use server";

import { verifySession } from "@/lib/dal";
import { auth } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import ProjectModel from "@/models/Project";
import mongoose from "mongoose";
import { ProjectSchema } from "@/lib/schemas/project.zod";

export async function handleCreateProject(formData: FormData) {
  // server-side Zod check as a security fallback (if client-side check is bypassed)
  const result = ProjectSchema.omit({ creator: true }).safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  if (!result.success) throw new Error("Invalid project data");

  const session = await verifySession();
  await connectDB();
  await ProjectModel.create({
    creator: new mongoose.Types.ObjectId(session.userId),
    ...result.data,
  });
  redirect("/test-dashboard");
}

export async function handleLogout() {
  await auth.api.signOut({ headers: await headers() });
  const cookieStore = await cookies();
  cookieStore.delete("better-auth.session_token");
  cookieStore.delete("__Secure-better-auth.session_token");
  redirect("/test-login");
}
