import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/db";
import { verifySession } from "@/lib/dal";

import User from "@/models/User";
import Project from "@/models/Project";
import Remix from "@/models/Remix";

export async function DELETE(request: NextRequest) {
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

    const userId = new mongoose.Types.ObjectId(session.userId);

    const projects = await Project.find({
      creator: userId,
    });

    const projectIds = projects.map((p) => p._id);

    await Remix.deleteMany({
      project: {
        $in: projectIds,
      },
    });

    await Project.deleteMany({
      creator: userId,
    });

    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete account",
      },
      {
        status: 500,
      },
    );
  }
}
