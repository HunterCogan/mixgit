import { verifySession } from "@/lib/dal";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ProjectModel from "@/models/Project";
import UserModel from "@/models/User";
import mongoose from "mongoose";

// POST — add a collaborator to the project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId: targetUserId } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 },
      );
    }

    if (!targetUserId || typeof targetUserId !== "string") {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(targetUserId)
    ) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const session = await verifySession();
    await connectDB();

    const project = await ProjectModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      creator: new mongoose.Types.ObjectId(session.userId),
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or you are not the owner" },
        { status: 404 },
      );
    }

    if (targetUserId === session.userId) {
      return NextResponse.json(
        { error: "You are already the project owner" },
        { status: 400 },
      );
    }

    const targetUser = await UserModel.findById(targetUserId).lean();
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const alreadyOnTeam = project.team.some(
      (memberId: unknown) => String(memberId) === targetUserId,
    );

    if (alreadyOnTeam) {
      return NextResponse.json(
        { error: "User is already a collaborator" },
        { status: 400 },
      );
    }

    await ProjectModel.updateOne(
      { _id: project._id },
      { $addToSet: { team: targetUserId } },
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Add collaborator error:", error);
    return NextResponse.json(
      { error: "Failed to add collaborator" },
      { status: 500 },
    );
  }
}

// DELETE - Remove a collaborator from the project
// TODO: This can be used once frontend Delete Collaborator is done
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId: targetUserId } = body;

    if (!id || !targetUserId) {
      return NextResponse.json(
        { error: "Project ID and User ID are required" },
        { status: 400 },
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(targetUserId)
    ) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const session = await verifySession();
    await connectDB();

    const project = await ProjectModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      creator: new mongoose.Types.ObjectId(session.userId),
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or you are not the owner" },
        { status: 404 },
      );
    }

    await ProjectModel.updateOne(
      { _id: project._id },
      { $pull: { team: targetUserId } },
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Remove collaborator error:", error);
    return NextResponse.json(
      { error: "Failed to remove collaborator" },
      { status: 500 },
    );
  }
}
