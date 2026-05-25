import { z } from "zod";

const ProgramFileSchema = z.object({
  name: z.string(),
  fileType: z.enum(["asset", "logic"]),
  data: z.string().optional(),
  imagePath: z.string().optional(),
});

export const RemixSchema = z.object({
  project: z.string(),
  uploader: z.string(),
  name: z
    .string()
    .trim()
    .min(1, "Remix name must be atleast 1 character")
    .max(200, "Remix name cannot exceed 200 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Remix description must be atleast 1 character")
    .max(300, "Remix description cannot exceed 300 characters"),
  isMain: z.boolean().default(false),
  parents: z.array(z.string()).optional(),
  files: z.array(ProgramFileSchema).optional(),
});

export type ProgramFile = z.infer<typeof ProgramFileSchema>;
export type Remix = z.infer<typeof RemixSchema>;
