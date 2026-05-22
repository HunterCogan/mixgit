import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// Logs out the current user by invalidating their session
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { message: "No active session to logout from" },
        { status: 200 },
      );
    }

    const response = await auth.api.signOut({
      headers: request.headers,
      asResponse: true,
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
