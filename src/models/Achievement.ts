import mongoose from "mongoose";

export interface IAchievement {
  name: string;
  description: string;
  goal: number;
}

const AchievementSchema = new mongoose.Schema<IAchievement>(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    goal: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const Achievement =
  mongoose.models.Achievement ||
  mongoose.model<IAchievement>("Achievement", AchievementSchema);

export default Achievement;

export const ACHIEVEMENTS: IAchievement[] = [
  {
    name: "Let's Get Started",
    description: "Create your first project on MixGit.",
    goal: 1,
  },
  {
    name: "New Remix",
    description: "Create a remix for your project.",
    goal: 1,
  },
  {
    name: "Repo Founder",
    description: "Create your first repository.",
    goal: 1,
  },
  {
    name: "Getting the Hang of It",
    description: "Reach 10 total commits.",
    goal: 10,
  },
  {
    name: "Commit Streak",
    description: "Reach 100 total commits.",
    goal: 100,
  },
  {
    name: "Commit Machine",
    description: "Reach 1,000 total commits.",
    goal: 1000,
  },
];
