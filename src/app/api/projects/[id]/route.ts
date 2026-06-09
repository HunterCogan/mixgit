import { verifySession } from "@/lib/dal";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ProjectModel from "@/models/Project";
import RemixModel from "@/models/Remix";
import mongoose from "mongoose";
import { ProjectSchema } from "@/lib/schemas/project.zod";
import z from "zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 },
      );
    }

    const session = await verifySession();
    await connectDB();

    const project = await ProjectModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      creator: new mongoose.Types.ObjectId(session.userId),
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const remixes = await RemixModel.find({ project: project._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ project, remixes }, { status: 200 });
  } catch (error) {
    console.error("Get project error:", error);
    return NextResponse.json(
      { error: "Failed to get project" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body = await request.json();

    const result = ProjectSchema.omit({ creator: true }).safeParse({
      name: body.name,
      description: body.description || undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: z.flattenError(result.error).fieldErrors },
        { status: 400 },
      );
    }

    const session = await verifySession();
    await connectDB();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Project ID is required",
        },
        {
          status: 400,
        },
      );
    }

    const project = await ProjectModel.findById(id);

    if (!project) {
      return NextResponse.json(
        {
          error: "Project not found",
        },
        {
          status: 404,
        },
      );
    }

    if (project.creator.toString() !== session.userId) {
      return NextResponse.json(
        {
          error: "User does not own this project",
        },
        {
          status: 403,
        },
      );
    }

    if (body.name !== undefined) {
      project.name = body.name;
    }

    if (body.description !== undefined) {
      project.description = body.description;
    }

    await project.save();

    return NextResponse.json(
      {
        success: true,
        project,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Update project error:", error);

    return NextResponse.json(
      {
        error: "Failed to update project",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 },
      );
    }

    const session = await verifySession();
    await connectDB();

    // TODO: When a project is deleted, all associated files should also be deleted with it
    // e.g. Remix (contains ProgramFiles) and assets (images, sounds)
    const result = await ProjectModel.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
      creator: new mongoose.Types.ObjectId(session.userId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
