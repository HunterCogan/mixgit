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
    name: "The Project Creator",
    description: "Create 10 projects on MixGit.",
    goal: 10,
  },
  {
    name: "Team Player",
    description: "Add a collaborator to one of your projects.",
    goal: 1,
  },
];
