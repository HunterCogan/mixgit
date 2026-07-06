import { verifySession } from "@/lib/dal";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ProjectModel from "@/models/Project";
import RemixModel from "@/models/Remix";
import mongoose from "mongoose";
import { generateSlug } from "@/lib/slugify";
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

      const newSlug = generateSlug(body.name);
      const conflict = await ProjectModel.findOne({
        creator: project.creator,
        slug: newSlug,
        _id: { $ne: project._id },
      });

      if (conflict) {
        return NextResponse.json(
          { error: "You already have a project with a similar name." },
          { status: 409 },
        );
      }

      project.slug = newSlug;
    }

    if (body.description !== undefined) {
      project.description = body.description;
    }

    if (body.tags !== undefined) {
      project.tags = body.tags;
    }

    await project.save();

    return NextResponse.json(
      {
        success: true,
        project,
        slug: project.slug,
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

    const result = await ProjectModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      creator: new mongoose.Types.ObjectId(session.userId),
    });

    if (!result) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await RemixModel.deleteMany({ project: result._id });
    await ProjectModel.deleteOne({ _id: result._id });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
