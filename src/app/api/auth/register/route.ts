import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ProjectModel from "@/models/Project";
import mongoose from "mongoose";

const ONBOARDING_PROJECT_ID = "6a32deb0d811a1a70783102e";
const ONBOARDING_PROJECT_CREATOR_ID = "6a179622ed55953a60a86130";

async function addToOnboardingProject(userId: string) {
  await connectDB();
  await ProjectModel.updateOne(
    {
      _id: new mongoose.Types.ObjectId(ONBOARDING_PROJECT_ID),
      creator: new mongoose.Types.ObjectId(ONBOARDING_PROJECT_CREATOR_ID),
    },
    { $addToSet: { team: userId } },
  );
}

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

    // Better Auth hashes the password here. This uses "signUpEmail", which securely saves the password.
    const response = await auth.api.signUpEmail({
      body: {
        name: finalName,
        email,
        password,
      },
      asResponse: true,
    });

    const data = await response
      .clone()
      .json()
      .catch(() => null);
    if (data?.user?.id) {
      addToOnboardingProject(data.user.id).catch((err) =>
        console.error("Failed to add user to onboarding project:", err),
      );
    }

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
