import mongoose from "mongoose";

// Schema for User collection. For now we just have email and password with the creation data,
// but we can easily add more fields in the future (like name, profile picture, etc).
const UserSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
      onUpdate: () => new Date(),
    },
  },
  { collection: "user" },
);

// Create index on email for faster login queries
UserSchema.index({ email: 1 }, { unique: true });

// Optional: Create index on createdAt for sorting recent users
UserSchema.index({ createdAt: -1 });

export default mongoose.models.User || mongoose.model("User", UserSchema);
