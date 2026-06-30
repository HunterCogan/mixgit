import { verifySession } from "@/lib/dal";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import UserModel from "@/models/User";
import mongoose from "mongoose";
import SharedProjectsList from "./_components/SharedProjectsList";

type CollaboratingResult = {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  slug: string;
  tags?: string[];
  creator: mongoose.Types.ObjectId | string;
  team: (mongoose.Types.ObjectId | string)[];
  createdAt: Date;
  creatorInfo?: {
    name: string;
    username: string;
  };
};

export default async function SharedProjectsPage() {
  const { userId } = await verifySession();
  await connectDB();

  const objectId = new mongoose.Types.ObjectId(userId);

  const [currentUser, collaboratingRaw, sharingRaw] = await Promise.all([
    UserModel.findById(objectId).select("username").lean(),
    Project.aggregate<CollaboratingResult>([
      {
        $match: {
          $expr: {
            $in: [
              userId,
              { $map: { input: "$team", as: "id", in: { $toString: "$$id" } } },
            ],
          },
        },
      },
      {
        $lookup: {
          from: "user",
          let: { cid: { $toString: "$creator" } },
          pipeline: [
            { $match: { $expr: { $eq: [{ $toString: "$_id" }, "$$cid"] } } },
            { $project: { name: 1, username: 1 } },
          ],
          as: "creatorData",
        },
      },
      { $addFields: { creatorInfo: { $arrayElemAt: ["$creatorData", 0] } } },
      { $sort: { createdAt: -1 } },
    ]),
    Project.find({ creator: objectId, "team.0": { $exists: true } })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const username = currentUser?.username ?? "";

  const collaborating = collaboratingRaw.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    tags: p.tags ?? [],
    createdAt: new Date(p.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    ownerName: p.creatorInfo?.name ?? "Unknown",
    ownerUsername: p.creatorInfo?.username ?? "",
  }));

  const sharing = sharingRaw.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    tags: p.tags ?? [],
    createdAt: new Date(p.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    teamCount: (p.team as unknown[]).length,
  }));

  return (
    <div className="w-full font-sans">
      <main className="max-w-3xl mx-auto px-3 sm:px-6 py-8 flex flex-col gap-6">
        <SharedProjectsList
          collaborating={collaborating}
          sharing={sharing}
          username={username}
        />
      </main>
    </div>
  );
}
