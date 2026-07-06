import { z } from "zod";

export const PROJECT_TAGS = ["Game", "Tool", "Art", "Music", "Story"] as const;

export const ProjectSchema = z.object({
  creator: z.string(),
  name: z
    .string()
    .trim()
    .min(1, "Project name must be at least 1 character")
    .max(200, "Project name cannot exceed 200 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Project description cannot exceed 500 characters")
    .optional(),
  team: z.array(z.string()).optional(),

  tags: z.array(z.enum(PROJECT_TAGS)).max(3).optional(),
});

export type Project = z.infer<typeof ProjectSchema>;
