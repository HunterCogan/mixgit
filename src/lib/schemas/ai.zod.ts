import { z } from "zod";

const AIFeedbackTopicSchema = z.object({
  title: z
    .string()
    .describe(
      "A short headline for this topic — aim for 8 words or fewer so it fits on one line. Put the explanation in `detail`, not here.",
    ),
  detail: z.string(),
});

/**
 * The structured feedback the model delivers by calling the `submit_feedback` tool.
 */
export const SubmitFeedbackSchema = z.object({
  what_works_well: z
    .string()
    .describe("A sentence that describes what the project does well."),
  logic_issues: z
    .array(AIFeedbackTopicSchema)
    .min(0)
    .max(2)
    .describe("Logic issues you notice in the project."),
  suggestions: z
    .array(AIFeedbackTopicSchema)
    .min(2)
    .max(3)
    .describe("Suggestions for improving the project."),
});

export type AIFeedbackTopic = z.infer<typeof AIFeedbackTopicSchema>;
export type SubmitFeedbackResult = z.infer<typeof SubmitFeedbackSchema>;
