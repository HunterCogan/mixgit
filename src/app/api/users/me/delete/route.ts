import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { password } = body;

    await auth.api.deleteUser({
      headers: request.headers,
      body: {
        password,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Delete account error:", error);

    return NextResponse.json(
      {
        error: "Failed to delete account",
      },
      {
        status: 400,
      },
    );
  }
}
