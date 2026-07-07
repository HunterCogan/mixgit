import { verifySession } from "@/lib/dal";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ProjectModel from "@/models/Project";
import RemixModel from "@/models/Remix";
import mongoose from "mongoose";
import { FileNameSchema, RemixSchema } from "@/lib/schemas/remix.zod";
import { z } from "zod";

export async function POST(
  request: NextRequest,
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

    const body = await request.json();

    const creatorId = body.creatorId;
    if (!creatorId) {
      return NextResponse.json(
        { error: "Creator ID is required" },
        { status: 400 },
      );
    }

    const project = await ProjectModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      creator: new mongoose.Types.ObjectId(creatorId),
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const isAuthorized =
      project.creator.equals(session.userId) ||
      project.team.some((memberId: mongoose.Types.ObjectId) =>
        memberId.equals(session.userId),
      );

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = RemixSchema.omit({
      project: true,
      uploader: true,
    }).safeParse({
      name: body.name,
      description: body.description,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: z.flattenError(result.error).fieldErrors },
        { status: 400 },
      );
    }

    const rawData: string = body.projectData ?? body.code ?? "";

    let remixType: "blockcode" | "raw";
    let fileName: string;
    try {
      JSON.parse(rawData);
      remixType = "blockcode";
      fileName = "project.json";
    } catch {
      remixType = "raw";
      const fileNameResult = FileNameSchema.safeParse(body.fileName);
      if (!fileNameResult.success) {
        return NextResponse.json(
          { error: fileNameResult.error.issues[0].message },
          { status: 400 },
        );
      }
      fileName = fileNameResult.data;
    }

    // TODO: a Remix is created with the "project.json" ProgramFile
    // when backend implements image/sound storage, a ProgramFile with fileType: "asset" should be created to point to each asset.
    const remix = await RemixModel.create({
      project: project._id,
      uploader: new mongoose.Types.ObjectId(session.userId),
      ...result.data,
      remixType,
      files: [{ name: fileName, fileType: "logic", data: rawData }],
    });

    return NextResponse.json({ remix }, { status: 201 });
  } catch (error) {
    console.error("Create remix error:", error);
    return NextResponse.json(
      { error: "Failed to create remix" },
      { status: 500 },
    );
  }
}
