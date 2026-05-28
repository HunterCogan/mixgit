import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { verifySession } from "@/lib/dal";
import User from "@/models/User";
import { auth } from "@/lib/auth";

export async function PUT(request: NextRequest) {
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

    const body = await request.json();

    // Password update handled by Better Auth
    if (body.password) {
      const response = await auth.api.changePassword({
        body: {
          currentPassword: body.currentPassword,
          newPassword: body.password,
          revokeOtherSessions: false,
        },
        headers: new Headers(request.headers),
        asResponse: false,
      });

      console.log("Password change response:", response);
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.userId,
      {
        ...(body.username && {
          username: body.username,
        }),

        ...(body.bio && {
          bio: body.bio,
        }),

        ...(body.profileImage && {
          profileImage: body.profileImage,
        }),
      },
      {
        returnDocument: "after",
      },
    );

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update settings",
      },
      {
        status: 500,
      },
    );
  }
}
