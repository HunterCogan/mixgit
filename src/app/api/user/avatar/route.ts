import { verifySession } from "@/lib/dal";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Avatar from "@/models/Avatar";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const session = await verifySession();

    await connectDB();

    const body = await request.json();

    const existingUser = await User.findById(session.userId);

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (body.imagePath === null && existingUser.imagePath) {
      await Avatar.findByIdAndDelete(session.userId);
    }

    const user = await User.findByIdAndUpdate(
      session.userId,
      {
        imagePath: body.imagePath,
      },
      {
        new: true,
      },
    );

    return NextResponse.json(
      {
        success: true,
        user,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Avatar update error:", error);

    return NextResponse.json(
      {
        error: "Failed to update avatar",
      },
      {
        status: 500,
      },
    );
  }
}
