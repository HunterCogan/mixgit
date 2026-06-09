import { z } from "zod";

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const UserProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(64, "Name must be 64 characters or less"),
  color: z
    .string()
    .trim()
    .regex(hexColorRegex, "Color must be a hex value like #a1b2c3"),
  about: z
    .string()
    .max(500, "About must be 500 characters or less")
    .optional()
    .default(""),
});

export type UserProfileInput = z.infer<typeof UserProfileSchema>;
