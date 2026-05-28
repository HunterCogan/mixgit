import { verifySession } from "@/lib/dal";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import mongoose from "mongoose";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const { userId } = await verifySession();

  await connectDB();
  const objectId = new mongoose.Types.ObjectId(userId);

  const [projects, sharedProjects] = await Promise.all([
    Project.find({ creator: objectId }).sort({ createdAt: -1 }).limit(5).lean(),
    Project.find({
      $expr: {
        $in: [
          userId,
          { $map: { input: "$team", as: "id", in: { $toString: "$$id" } } },
        ],
      },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const serialized = projects.map((p) => ({
    id: p._id.toString(),
    name: p.name,
  }));

  const serializedShared = sharedProjects.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    creatorId: p.creator.toString(),
  }));

  return (
    <NavbarClient
      projects={serialized}
      userId={userId}
      sharedProjects={serializedShared}
    />
  );
}
