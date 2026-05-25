import mongoose from "mongoose";
import "@/models/User";

export interface IProgramFile {
  name: string;
  fileType: "asset" | "logic";
  data?: string;
  imagePath?: string;
}

export interface IRemix {
  project: mongoose.Types.ObjectId;
  uploader: mongoose.Types.ObjectId;
  name: string;
  description: string;
  isMain: boolean;
  parents: mongoose.Types.ObjectId[];
  files: IProgramFile[];
  createdAt: Date;
  updatedAt: Date;
}

const ProgramFileSchema = new mongoose.Schema<IProgramFile>(
  {
    name: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
      enum: ["asset", "logic"],
    },
    data: {
      type: String,
    },
    imagePath: {
      type: String,
    },
  },
  { _id: false },
);

const RemixSchema = new mongoose.Schema<IRemix>(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [1, "Remix name must be atleast 1 character"],
      maxlength: [200, "Remix name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: [1, "Remix description must be atleast 1 character"],
      maxlength: [300, "Remix description cannot exceed 300 characters"],
    },
    isMain: {
      type: Boolean,
      required: true,
      default: false,
    },
    parents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Remix",
      },
    ],
    files: [ProgramFileSchema],
  },
  { collection: "remix", timestamps: true },
);

RemixSchema.index({ project: 1 });
RemixSchema.index({ uploader: 1 });
RemixSchema.index({ createdAt: -1 });

export default (mongoose.models.Remix as mongoose.Model<IRemix>) ||
  mongoose.model<IRemix>("Remix", RemixSchema);
