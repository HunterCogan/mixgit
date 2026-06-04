import { verifySession } from "@/lib/dal";
import connectDB from "@/lib/db";
import RemixModel from "@/models/Remix";
import ProjectModel from "@/models/Project";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
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

    const isAuthorized =
      remix.uploader.equals(session.userId) ||
      project?.creator.equals(session.userId);

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await RemixModel.deleteOne({
      _id: remix._id,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete remix error:", error);

    return NextResponse.json(
      { error: "Failed to delete remix" },
      { status: 500 },
    );
  }
}
