import { verifySession } from "@/lib/dal";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import UserModel from "@/models/User";
import mongoose from "mongoose";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const { userId } = await verifySession();

  await connectDB();
  const objectId = new mongoose.Types.ObjectId(userId);

  const [currentUser, projects, sharedProjects] = await Promise.all([
    UserModel.findById(objectId).select("username").lean(),
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

  const username = currentUser?.username ?? "";

  const creatorIds = [
    ...new Set(sharedProjects.map((p) => p.creator.toString())),
  ];
  const creators = await UserModel.find({ _id: { $in: creatorIds } })
    .select("_id username")
    .lean();
  const creatorUsernameMap = new Map(
    creators.map((c) => [c._id.toString(), c.username]),
  );

  const serialized = projects.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    slug: p.slug,
  }));

  const serializedShared = sharedProjects.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    creatorId: p.creator.toString(),
    creatorUsername: creatorUsernameMap.get(p.creator.toString()) ?? "",
    slug: p.slug,
  }));

  return (
    <NavbarClient
      projects={serialized}
      username={username}
      sharedProjects={serializedShared}
      achievements={[]}
    />
  );
}
