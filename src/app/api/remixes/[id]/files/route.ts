import { verifySession } from "@/lib/dal";
import connectDB from "@/lib/db";
import RemixModel, { type IProgramFile } from "@/models/Remix";
import ProjectModel from "@/models/Project";
import { NextRequest, NextResponse } from "next/server";
import { FileNameSchema } from "@/lib/schemas/remix.zod";
import mongoose from "mongoose";

export async function POST(
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
      project?.team.some((memberId: mongoose.Types.ObjectId) =>
        memberId.equals(session.userId),
      );
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (remix.remixType !== "raw") {
      return NextResponse.json(
        { error: "Only raw code remixes support multiple files" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const result = FileNameSchema.safeParse(body.name);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 },
      );
    }
    const name = result.data;

    if (remix.files.some((f: IProgramFile) => f.name === name)) {
      return NextResponse.json(
        { error: "A file with that name already exists" },
        { status: 400 },
      );
    }

    remix.files.push({ name, fileType: "logic", data: "" });
    await remix.save();

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Add file error:", error);
    return NextResponse.json({ error: "Failed to add file" }, { status: 500 });
  }
}

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
      project?.team.some((memberId: mongoose.Types.ObjectId) =>
        memberId.equals(session.userId),
      );
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (remix.remixType !== "raw") {
      return NextResponse.json(
        { error: "Only raw code remixes support multiple files" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { name } = body;
    if (typeof name !== "string" || !name) {
      return NextResponse.json(
        { error: "File name is required" },
        { status: 400 },
      );
    }

    const result = FileNameSchema.safeParse(body.newName);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 },
      );
    }
    const newName = result.data;

    const file = remix.files.find((f: IProgramFile) => f.name === name);
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (
      newName !== name &&
      remix.files.some((f: IProgramFile) => f.name === newName)
    ) {
      return NextResponse.json(
        { error: "A file with that name already exists" },
        { status: 400 },
      );
    }

    file.name = newName;
    await remix.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Rename file error:", error);
    return NextResponse.json(
      { error: "Failed to rename file" },
      { status: 500 },
    );
  }
}

export async function DELETE(
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
      project?.team.some((memberId: mongoose.Types.ObjectId) =>
        memberId.equals(session.userId),
      );
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (remix.remixType !== "raw") {
      return NextResponse.json(
        { error: "Only raw code remixes support multiple files" },
        { status: 400 },
      );
    }

    const { name } = await req.json();
    if (typeof name !== "string" || !name) {
      return NextResponse.json(
        { error: "File name is required" },
        { status: 400 },
      );
    }

    const logicFiles = remix.files.filter(
      (f: IProgramFile) => f.fileType === "logic",
    );
    if (logicFiles.length <= 1) {
      return NextResponse.json(
        { error: "A remix must have at least one file" },
        { status: 400 },
      );
    }

    const idx = remix.files.findIndex((f: IProgramFile) => f.name === name);
    if (idx === -1) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    remix.files.splice(idx, 1);
    await remix.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete file error:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 },
    );
  }
}
