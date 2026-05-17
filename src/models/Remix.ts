import { maxLength } from "better-auth";
import mongoose from "mongoose";

const ProgramFileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
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

const RemixSchema = new mongoose.Schema(
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
    description: {
      type: String,
      required: true,
      maxLength: 500,
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

export default mongoose.models.Remix || mongoose.model("Remix", RemixSchema);
