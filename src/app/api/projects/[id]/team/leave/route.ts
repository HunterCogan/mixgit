import { verifySession } from "@/lib/dal";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ProjectModel from "@/models/Project";
import mongoose from "mongoose";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 },
      );
    }

    const session = await verifySession();
    await connectDB();

    const project = await ProjectModel.findById(id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.creator.toString() === session.userId) {
      return NextResponse.json(
        { error: "Project owner cannot leave the project" },
        { status: 400 },
      );
    }

    const isMember = project.team.some(
      (memberId: unknown) => String(memberId) === session.userId,
    );

    if (!isMember) {
      return NextResponse.json(
        { error: "You are not a member of this project" },
        { status: 400 },
      );
    }

    await ProjectModel.updateOne(
      { _id: project._id },
      { $pull: { team: new mongoose.Types.ObjectId(session.userId) } },
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Leave project error:", error);
    return NextResponse.json(
      { error: "Failed to leave project" },
      { status: 500 },
    );
  }
}
