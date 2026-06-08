import { Anthropic } from "@anthropic-ai/sdk";

/**
 * Tool used by Claude to create structured Remix feedback.
 * ```ts
 * const feedback = toolUse?.input as AiFeedback;
 * ```
 */
export const feedbackTool: Anthropic.Tool = {
  name: "submit_feedback",
  description: "Submit feedback for a Scratch remix",
  input_schema: {
    type: "object",
    properties: {
      what_works_well: {
        type: "string",
        description: "A sentence that describes what the project does well.",
      },
      suggestions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            detail: { type: "string" },
          },
          required: ["title", "detail"],
        },
        description: "2-3 suggestions for improving the project.",
      },
      logic_issues: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            detail: { type: "string" },
          },
          required: ["title", "detail"],
        },
        description:
          "1-2 logic issues you notice in the project. If none, consider potential concerns.",
      },
    },
    required: ["what_works_well", "suggestions", "logic_issues"],
  },
  cache_control: { type: "ephemeral" },
};
