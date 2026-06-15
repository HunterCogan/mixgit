import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

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

    const cookieStore = await cookies();

    cookieStore.delete("better-auth.session_token");
    cookieStore.delete({
      name: "__Secure-better-auth.session_token",
      secure: true,
      sameSite: "lax",
      path: "/",
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
