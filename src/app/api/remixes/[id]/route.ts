import { verifySession } from "@/lib/dal";
import connectDB from "@/lib/db";
import RemixModel from "@/models/Remix";
import ProjectModel from "@/models/Project";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
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
      project?.creator.equals(session.userId) ||
      project?.team.some((memberId: import("mongoose").Types.ObjectId) =>
        memberId.equals(session.userId),
      );

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (remix.remixType !== "raw") {
      return NextResponse.json(
        { error: "Only raw code remixes can be edited" },
        { status: 400 },
      );
    }

    const { code, fileName } = await req.json();
    if (typeof code !== "string") {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }
    if (typeof fileName !== "string" || !fileName) {
      return NextResponse.json(
        { error: "File name is required" },
        { status: 400 },
      );
    }

    const logicFile = remix.files.find(
      (f: import("@/models/Remix").IProgramFile) =>
        f.fileType === "logic" && f.name === fileName,
    );
    if (!logicFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    logicFile.data = code;
    await remix.save();

    console.log("========== PATCH ==========");
    console.log("Remix:", remix._id.toString());
    console.log("File:", fileName);
    console.log("Saved code:");
    console.log(logicFile.data);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Update remix error:", error);
    return NextResponse.json(
      { error: "Failed to update remix" },
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
