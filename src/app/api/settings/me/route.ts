import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { verifySession } from "@/lib/dal";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await verifySession();

    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    await connectDB();

    const user = await User.findById(session.userId).select(
      "username bio profileImage",
    );

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load user",
      },
      {
        status: 500,
      },
    );
  }
}
