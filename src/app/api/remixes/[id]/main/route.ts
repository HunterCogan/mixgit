import { verifySession } from "@/lib/dal";
import connectDB from "@/lib/db";
import RemixModel from "@/models/Remix";
import ProjectModel from "@/models/Project";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await verifySession();
    await connectDB();

    const remix = await RemixModel.findById(id);
    if (!remix) {
      return NextResponse.json({ error: "Remix not found" }, { status: 404 });
    }

    const project = await ProjectModel.findById(remix.project);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.creator.equals(session.userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (remix.isMain) {
      return NextResponse.json(
        { message: "Remix is already the main mix" },
        { status: 200 },
      );
    }

    await RemixModel.updateMany(
      { project: remix.project, isMain: true },
      { $set: { isMain: false } },
    );

    remix.isMain = true;
    await remix.save();

    return NextResponse.json(
      { message: "Main remix updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Set main remix error:", error);

    return NextResponse.json(
      { error: "Failed to set main remix" },
      { status: 500 },
    );
  }
}
