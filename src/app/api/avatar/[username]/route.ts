import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Avatar from "@/models/Avatar";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;

  await connectDB();

  const user = await User.findOne({ username }).select("_id").lean();

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const avatar = await Avatar.findById(user._id);

  if (!avatar) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(avatar.data), {
    headers: {
      "Content-Type": avatar.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
