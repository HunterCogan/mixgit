import { verifySession } from "@/lib/dal";
import connectDB from "@/lib/db";
import { UserProfileSchema } from "@/lib/schemas/user.zod";
import UserModel from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function PATCH(request: NextRequest) {
  try {
    const session = await verifySession();
    const body = await request.json();

    const result = UserProfileSchema.safeParse({
      name: body.name,
      color: body.color,
      about: body.about ?? "",
    });

    if (!result.success) {
      return NextResponse.json(
        { error: z.flattenError(result.error).fieldErrors },
        { status: 400 },
      );
    }

    await connectDB();

    const user = await UserModel.findByIdAndUpdate(
      session.userId,
      {
        name: result.data.name,
        color: result.data.color,
        about: result.data.about,
      },
      { returnDocument: "after" },
    ).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: session.userId,
        name: user.name,
        email: user.email,
        color: user.color,
        about: user.about ?? "",
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
