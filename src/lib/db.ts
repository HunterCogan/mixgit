import mongoose from "mongoose";

type MongooseCache = {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

if (!global.__mongoose) {
  global.__mongoose = { conn: null, promise: null };
}

const cached: MongooseCache = global.__mongoose;

// this function is currently used for db connections.
async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m.connection);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
