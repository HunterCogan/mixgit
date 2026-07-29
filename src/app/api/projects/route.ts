import { verifySession } from "@/lib/dal";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ProjectModel from "@/models/Project";
import { generateSlug } from "@/lib/slugify";
import RemixModel from "@/models/Remix";
import mongoose from "mongoose";
import { ProjectSchema } from "@/lib/schemas/project.zod";
import { z } from "zod";
import DEFAULT_PROJECT_JSON from "@/lib/defaults/project.json";
import { updateAchievementProgress } from "@/lib/update-achievements";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = ProjectSchema.omit({ creator: true }).safeParse({
      name: body.name,
      description: body.description || undefined,
      visibility: body.visibility,
      tags: body.tags || [],
    });

    if (!result.success) {
      return NextResponse.json(
        { error: z.flattenError(result.error).fieldErrors },
        { status: 400 },
      );
    }

    const session = await verifySession();
    await connectDB();

    const slug = generateSlug(result.data.name);

    const existing = await ProjectModel.findOne({
      creator: new mongoose.Types.ObjectId(session.userId),
      slug,
    });

    if (existing) {
      return NextResponse.json(
        { error: "You already have a project with that name" },
        { status: 409 },
      );
    }

    const project = await ProjectModel.create({
      creator: new mongoose.Types.ObjectId(session.userId),
      slug,
      ...result.data,
    });

    await RemixModel.create({
      project: project._id,
      uploader: new mongoose.Types.ObjectId(session.userId),
      name: "main",
      description: "Hello, world!",
      isMain: true,
      files: [
        {
          name: "project.json",
          fileType: "logic",
          data: JSON.stringify(DEFAULT_PROJECT_JSON),
        },
      ],
    });

    const unlockedAchievements: { achievementName: string }[] = [];
    try {
      const totalProjectCount = await ProjectModel.countDocuments({
        creator: new mongoose.Types.ObjectId(session.userId),
      });

      const results = await Promise.allSettled([
        updateAchievementProgress("Let's Get Started", 1),
        updateAchievementProgress("The Project Creator", totalProjectCount),
      ]);

      for (const result of results) {
        if (result.status === "fulfilled" && result.value.justCompleted) {
          unlockedAchievements.push({
            achievementName: result.value.achievementName,
          });
        } else if (result.status === "rejected") {
          console.error("Achievement tracking error:", result.reason);
        }
      }
    } catch (achievementError) {
      console.error("Achievement tracking error:", achievementError);
    }

    return NextResponse.json(
      { project, unlockedAchievements },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}
