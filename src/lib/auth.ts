import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import connectDB from "./db";

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

  rememberMe: {
    enabled: true,
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
