import { verifySession } from "@/lib/dal";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import Remix from "@/models/Remix";
import mongoose from "mongoose";

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

    const project = await Project.findOne({
      _id: new mongoose.Types.ObjectId(id),
      creator: new mongoose.Types.ObjectId(session.userId),
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const remixes = await Remix.find({ project: project._id })
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

    // TODO: When a project is deleted, all associated files should also be deleted with it (e.g. Remix (contains ProgramFiles), images)

    const result = await Project.deleteOne({
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
