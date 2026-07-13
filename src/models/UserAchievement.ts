import mongoose, { Schema, models, model } from "mongoose";

export interface IUserAchievement {
  user: mongoose.Types.ObjectId;
  achievement: mongoose.Types.ObjectId;
  progress: number;
  completed: boolean;
  unlockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserAchievementSchema = new Schema<IUserAchievement>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    achievement: {
      type: Schema.Types.ObjectId,
      ref: "Achievement",
      required: true,
    },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    unlockedAt: { type: Date },
  },
  { timestamps: true },
);

// Prevent duplicate progress records for the same user/achievement pair
UserAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });

const UserAchievement =
  models.UserAchievement ||
  model<IUserAchievement>("UserAchievement", UserAchievementSchema);

export default UserAchievement;
