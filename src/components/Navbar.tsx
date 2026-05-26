import { verifySession } from "@/lib/dal";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import mongoose from "mongoose";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const { userId } = await verifySession();

  await connectDB();
  const projects = await Project.find({
    creator: new mongoose.Types.ObjectId(userId),
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const serialized = projects.map((p) => ({
    id: p._id.toString(),
    name: p.name,
  }));

  return <NavbarClient projects={serialized} userId={userId} />;
}
