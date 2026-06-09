import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// Logs in a user with email and password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    if (rememberMe) {
      console.log("Remember Me is enabled");
    } else {
      console.log("Remember Me is disabled");
    }

    const authResponse = await auth.api.signInEmail({
      body: {
        email,
        password,
        rememberMe,
      },
      asResponse: true,
    });

    return authResponse;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
