import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import connectDB from "./db";
import ProjectModel from "@/models/Project";
import mongoose from "mongoose";

// Establish MongoDB connection once the module loads
const conn = await connectDB();
const client = conn.getClient();

const authSecret = process.env.BETTER_AUTH_SECRET;
if (!authSecret) {
  throw new Error("Missing BETTER_AUTH_SECRET environment variable.");
}

export const auth = betterAuth({
  // Use MongoDB adapter with the connected client's database
  database: mongodbAdapter(client.db()),
  secret: authSecret,
  user: {
    deleteUser: {
      enabled: true,
    },

    additionalFields: {
      color: {
        type: "string",
        required: false,
        defaultValue: () =>
          "#" +
          Math.floor(Math.random() * 0xffffff)
            .toString(16)
            .padStart(6, "0"),
      },
      about: {
        type: "string",
        required: false,
        defaultValue: "",
      },
    },
  },
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  basePath: "/api/auth",

  // Email and password authentication configuration
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  // If we want to verify the email, we need to add
  // "sendVerificationEmail" in "emailVerification" and set "requireEmailVerification" to true.
  // This is an optional thing that we will discuss in the future

  // Session configuration can set the session duration and cookie attributes.
  session: {
    expiresIn: 60 * 60 * 24, // 1 day base session
    updateAgeUnitInMs: 24 * 60 * 60 * 1000,
    cookieAttributes: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  },

  plugins: [username()],

  rememberMe: {
    enabled: true,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const { getReservedUsernames } = await import("./reservedUsernames");
          const reserved = getReservedUsernames();
          const uname = (user as { username?: string }).username ?? "";
          if (reserved.includes(uname.toLowerCase())) {
            throw new Error("Username is not available");
          }
        },
        after: async (user) => {
          try {
            await connectDB();
            await ProjectModel.updateOne(
              {
                _id: new mongoose.Types.ObjectId("6a32deb0d811a1a70783102e"),
                creator: new mongoose.Types.ObjectId(
                  "6a179622ed55953a60a86130",
                ),
              },
              { $addToSet: { team: user.id } },
            );
          } catch (err) {
            console.error("Failed to add user to onboarding project:", err);
          }
        },
      },
    },
  },

  // JWT token configuration
  jwt: {
    expiresIn: 15 * 60, // 15 minutes in seconds
  },

  // generateId disables Better Auth ID generation, let MongoDB just use its native _id.
  // disablePasswordStrengthValidation enforces password strength validation.
  // For future document update, make sure we know that this defaults to min 8 and max 128 characters
  advanced: {
    database: {
      generateId: false,
    },
    disablePasswordStrengthValidation: false,
  },
});
