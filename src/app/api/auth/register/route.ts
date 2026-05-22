import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// Register/Sign Up a new user with email and password for now.
// We can add more fields in the future (name, icon, etc).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Keeping name for now incase we want to use it in the future
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Makes the "name" from just using the first part of an email
    const finalName =
      typeof name === "string" && name.trim()
        ? name.trim()
        : email.split("@")[0] || "User";

    // IMPORANT: This uses "signUpEmail", which securely saves the password.
    // Better Auth hashes the password here
    const response = await auth.api.signUpEmail({
      body: {
        name: finalName,
        email,
        password,
      },
      asResponse: true,
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
