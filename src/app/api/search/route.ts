import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import UserModel from "@/models/User";
import ProjectModel from "@/models/Project";
import RemixModel from "@/models/Remix";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    const category = searchParams.get("category") ?? "projects";

    if (!query || query.length === 0) {
      return NextResponse.json({ results: [] });
    }

    if (query.length > 200) {
      return NextResponse.json({ results: [] });
    }

    if (category !== "users" && category !== "projects") {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    await connectDB();

    const regex = new RegExp(query, "i");

    if (category === "users") {
      const users = await UserModel.find({
        $or: [{ name: regex }, { email: regex }],
      })
        .select("_id name email")
        .limit(8)
        .lean();

      const userIds = users.map((u) => u._id);
      const projectCounts = await ProjectModel.aggregate([
        { $match: { creator: { $in: userIds } } },
        { $group: { _id: "$creator", count: { $sum: 1 } } },
      ]);

      const countMap = new Map(
        projectCounts.map((p) => [p._id.toString(), p.count]),
      );

      const results = users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        projectCount: countMap.get(u._id.toString()) ?? 0,
      }));

      return NextResponse.json({ results });
    }

    const projects = await ProjectModel.find({ name: regex })
      .select("_id name creator")
      .limit(8)
      .lean();

    const projectIds = projects.map((p) => p._id);
    const remixCounts = await RemixModel.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: "$project", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(
      remixCounts.map((r) => [r._id.toString(), r.count]),
    );

    const results = projects.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      creatorId: p.creator.toString(),
      remixCount: countMap.get(p._id.toString()) ?? 0,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
