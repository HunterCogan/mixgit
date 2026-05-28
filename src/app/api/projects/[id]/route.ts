import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import { verifySession } from "@/lib/dal";
import Project from "@/models/Project";
import ProjectModel from "@/models/Project";
import RemixModel from "@/models/Remix";

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

    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const project = await ProjectModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      creator: new mongoose.Types.ObjectId(session.userId),
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const remixes = await RemixModel.find({
      project: project._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        project,
        remixes,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Get project error:", error);

    return NextResponse.json(
      {
        error: "Failed to get project",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await verifySession();

    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    await connectDB();

    const { id } = await params;

    const project = await Project.findById(id);

    if (!project) {
      return NextResponse.json(
        {
          success: false,
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
          success: false,
          error: "Unauthorized",
        },
        {
          status: 403,
        },
      );
    }

    // TODO: When a project is deleted, all associated files should also be deleted with it
    // e.g. Remix (contains ProgramFiles) and assets (images, sounds)

    await Project.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete project",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await verifySession();

    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid project id",
        },
        {
          status: 400,
        },
      );
    }

    const body = await request.json();

    const updates: {
      name?: string;
      description?: string;
      code?: string;
      updatedAt?: Date;
    } = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length < 1) {
        return NextResponse.json(
          {
            success: false,
            error: "Name is invalid",
          },
          {
            status: 400,
          },
        );
      }

      updates.name = body.name;
    }

    if (body.description !== undefined) {
      if (typeof body.description !== "string") {
        return NextResponse.json(
          {
            success: false,
            error: "Description is invalid",
          },
          {
            status: 400,
          },
        );
      }

      updates.description = body.description;
    }

    if (body.code !== undefined) {
      updates.code = body.code;
    }

    updates.updatedAt = new Date();

    const project = await Project.findOneAndUpdate(
      {
        _id: id,
        creator: new mongoose.Types.ObjectId(session.userId),
      },
      updates,
      {
        new: true,
      },
    );

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: "Project not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update project",
      },
      {
        status: 500,
      },
    );
  }
}
