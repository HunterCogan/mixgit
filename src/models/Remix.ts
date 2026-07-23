import mongoose from "mongoose";
import "@/models/User";

export interface IProgramFile {
  name: string;
  fileType: "asset" | "logic";
  data?: string;
  imagePath?: string;
}

export interface IAiFeedbackTopic {
  title: string;
  detail: string;
}

export interface IAiFeedback {
  whatWorksWell: string;
  suggestions: IAiFeedbackTopic[];
  logicIssues: IAiFeedbackTopic[];
  generatedAt: Date;
}

export interface IRemix {
  project: mongoose.Types.ObjectId;
  uploader: mongoose.Types.ObjectId;
  name: string;
  description: string;
  isMain: boolean;
  remixType: "blockcode" | "raw";
  parents: mongoose.Types.ObjectId[];
  files: IProgramFile[];
  aiFeedback?: IAiFeedback;
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

const AiFeedbackTopicSchema = new mongoose.Schema<IAiFeedbackTopic>(
  {
    title: {
      type: String,
      required: true,
    },
    detail: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const AiFeedbackSchema = new mongoose.Schema<IAiFeedback>(
  {
    whatWorksWell: {
      type: String,
      required: true,
    },
    suggestions: [AiFeedbackTopicSchema],
    logicIssues: [AiFeedbackTopicSchema],
    generatedAt: {
      type: Date,
      required: true,
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
    remixType: {
      type: String,
      enum: ["blockcode", "raw"],
      default: "blockcode",
    },
    parents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Remix",
      },
    ],
    files: [ProgramFileSchema],
    aiFeedback: {
      type: AiFeedbackSchema,
      required: false,
    },
  },
  { collection: "remix", timestamps: true },
);

RemixSchema.index({ project: 1 });
RemixSchema.index({ uploader: 1 });
RemixSchema.index({ createdAt: -1 });

export default (mongoose.models.Remix as mongoose.Model<IRemix>) ||
  mongoose.model<IRemix>("Remix", RemixSchema);
