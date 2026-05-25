import mongoose from "mongoose";
import "@/models/User";

export interface IProject {
  creator: mongoose.Types.ObjectId;
  name: string;
  description?: string;
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
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Project description cannot exceed 500 character"],
    },
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

export default (mongoose.models.Project as mongoose.Model<IProject>) ||
  mongoose.model<IProject>("Project", ProjectSchema);
