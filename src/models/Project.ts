import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
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
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 500,
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

export default mongoose.models.Project ||
  mongoose.model("Project", ProjectSchema);
