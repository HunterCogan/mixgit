import mongoose from "mongoose";

export interface IAvatar {
  _id: mongoose.Types.ObjectId;
  data: Buffer;
  contentType: string;
}

const AvatarSchema = new mongoose.Schema<IAvatar>(
  {
    data: {
      type: Buffer,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
    },
  },
  { collection: "avatar", timestamps: true },
);

export default (mongoose.models.Avatar as mongoose.Model<IAvatar>) ||
  mongoose.model<IAvatar>("Avatar", AvatarSchema);
