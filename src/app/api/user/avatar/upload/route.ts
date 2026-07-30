import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/dal";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Avatar from "@/models/Avatar";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const session = await verifySession();

    await connectDB();

    const user = await User.findById(session.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    await Avatar.findByIdAndUpdate(
      session.userId,
      { data: buffer, contentType: file.type },
      { upsert: true },
    );

    return NextResponse.json({
      success: true,
      imagePath: Date.now().toString(),
    });
  } catch (error) {
    console.error("Avatar upload error:", error);

    return NextResponse.json(
      {
        error: "Failed to upload image",
      },
      {
        status: 500,
      },
    );
  }
}
