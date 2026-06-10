import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { currentPassword, newPassword } = body;

    await auth.api.changePassword({
      headers: request.headers,
      body: {
        currentPassword,
        newPassword,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: unknown) {
    console.error("Change password error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to change password";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 400,
      },
    );
  }
}
