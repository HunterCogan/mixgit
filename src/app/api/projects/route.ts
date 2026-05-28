import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import { verifySession } from "@/lib/dal";
import Project from "@/models/Project";
import ProjectModel from "@/models/Project";
import RemixModel from "@/models/Remix";
import { ProjectSchema } from "@/lib/schemas/project.zod";
import { z } from "zod";
import DEFAULT_PROJECT_JSON from "@/lib/defaults/project.json";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();

    await connectDB();

    const { searchParams } = new URL(request.url);

    const limit = Number(searchParams.get("limit")) || 10;
    const page = Number(searchParams.get("page")) || 1;

    const projects = await Project.find({
      creator: new mongoose.Types.ObjectId(session.userId),
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch projects",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();

    await connectDB();

    const body = await request.json();

    const result = ProjectSchema.safeParse({
      ...body,
      creator: session.userId,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: z.treeifyError(result.error),
        },
        {
          status: 400,
        },
      );
    }

    const project = await ProjectModel.create({
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

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create project",
      },
      {
        status: 500,
      },
    );
  }
}
