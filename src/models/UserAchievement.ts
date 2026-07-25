import mongoose, { Schema, models, model } from "mongoose";

export interface IUserAchievement {
  user: mongoose.Types.ObjectId;
  achievementName: string;
  currentValue: number;
  completed: boolean;
  unlockedAt?: Date;
}

const UserAchievementSchema = new Schema<IUserAchievement>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    achievementName: { type: String, required: true },
    currentValue: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    unlockedAt: { type: Date },
  },
  { timestamps: true },
);

// Prevent duplicate progress records for the same user/achievement pair
UserAchievementSchema.index({ user: 1, achievementName: 1 }, { unique: true });

const UserAchievement =
  models.UserAchievement ||
  model<IUserAchievement>("UserAchievement", UserAchievementSchema);

export default UserAchievement;
