import { verifySession } from "@/lib/dal";
import connectDB from "@/lib/db";
import ProjectModel from "@/models/Project";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const body = await request.json();
    const { visibility } = body;

    if (!["public", "private"].includes(visibility)) {
      return NextResponse.json(
        { error: "Invalid visibility value" },
        { status: 400 },
      );
    }

    const session = await verifySession();
    await connectDB();

    const project = await ProjectModel.findById(id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.creator.equals(session.userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    project.visibility = visibility;
    await project.save();

    return NextResponse.json(
      { message: "Visibility updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update visibility error:", error);

    return NextResponse.json(
      { error: "Failed to update visibility" },
      { status: 500 },
    );
  }
}
