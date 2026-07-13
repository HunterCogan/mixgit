import mongoose, { Schema, models, model } from "mongoose";

export interface IAchievement {
  name: string;
  description: string;
  points: number;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    points: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

const Achievement =
  models.Achievement || model<IAchievement>("Achievement", AchievementSchema);

export default Achievement;
