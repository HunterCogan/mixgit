import mongoose from "mongoose";
import "@/models/User";

export interface IProject {
  creator: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  tags?: string[];
  team: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new mongoose.Schema<IProject>(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [1, "Project name must be atleast 1 character"],
      maxlength: [200, "Project name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Project description cannot exceed 500 characters"],
    },
    tags: [
      {
        type: String,
        enum: ["Game", "Tool", "Art", "Music", "Story"],
      },
    ],
    team: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { collection: "project", timestamps: true },
);

ProjectSchema.index({ creator: 1 });
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ creator: 1, slug: 1 }, { unique: true });

export default (mongoose.models.Project as mongoose.Model<IProject>) ||
  mongoose.model<IProject>("Project", ProjectSchema);
