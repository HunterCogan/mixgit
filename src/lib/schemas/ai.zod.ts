import { z } from "zod";

export const AIFeedbackTopicSchema = z.object({
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

/** `insert_block` tool — insert one block into a target's blocks map. */
export const InsertBlockToolSchema = z.object({
  target: z
    .string()
    .optional()
    .describe(
      "Exact Stage or sprite name. Required only when starting a new script (topLevel); for afterLine/afterId the target is inferred from the anchor block.",
    ),
  opcode: z.string().describe('Scratch opcode, e.g. "control_wait".'),
  inputs: z
    .record(z.string(), z.json())
    .optional()
    .describe(
      'Scratch input slots, e.g. { "DURATION": [1, [4, 2]] }. Omit or {} if none.',
    ),
  fields: z
    .record(z.string(), z.json())
    .optional()
    .describe(
      'Scratch fields, e.g. { "VARIABLE": ["score", "varId"] }. Omit or {} if none.',
    ),
  mutation: z.json().optional().describe("Optional procedure mutation object."),
  isShadow: z
    .boolean()
    .optional()
    .describe(
      "Set true when inserting a menu/dropdown shadow block (opcodes ending in `menu`, e.g. sensing_touchingobjectmenu). Wires the parent input as [1, id] and marks the block shadow:true.",
    ),
  afterLine: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional()
    .describe(
      "Pseudocode line number to insert immediately after. Use this to splice into existing code. Required unless afterId or topLevel is set.",
    ),
  afterId: z
    .string()
    .nullable()
    .optional()
    .describe(
      "Id returned by a previous insert_block call, to chain onto a block you just created. Use afterLine to reference existing code.",
    ),
  intoLine: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional()
    .describe(
      "Pseudocode line of the block whose input slot to fill. Use for reporters/booleans AND for C-block bodies (SUBSTACK). Requires inputName.",
    ),
  intoId: z
    .string()
    .nullable()
    .optional()
    .describe(
      "Id returned by a previous insert_block whose input slot to fill. Use for reporters/booleans AND for putting the first statement inside a C-block mouth (inputName SUBSTACK). Requires inputName.",
    ),
  inputName: z
    .string()
    .optional()
    .describe(
      'Name of the input slot when using intoLine/intoId, e.g. "CONDITION", "OPERAND1", "SUBSTACK", "SUBSTACK2".',
    ),
  shadow: z
    .json()
    .optional()
    .describe(
      'Fallback shadow primitive for a value slot when nesting, e.g. [10, ""] or [4, "0"]. Omit for boolean slots (e.g. control_if CONDITION, operator_and operands).',
    ),
  topLevel: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .nullable()
    .optional()
    .describe(
      "If set, create a new top-level stack at this canvas position instead of splicing after afterLine/afterId. Requires target.",
    ),
});

/** `delete_block` tool — remove the block on a given pseudocode line. */
export const DeleteBlockToolSchema = z.object({
  line: z
    .number()
    .int()
    .positive()
    .describe(
      "Pseudocode line number whose block should be deleted. Blocks after it stay connected; the block's own inputs and any blocks nested inside it are removed.",
    ),
});

/** `finish` tool — end the editing session with a student-facing explanation. */
export const FinishGenerateToolSchema = z.object({
  explanation: z
    .string()
    .describe(
      "A short, friendly explanation for the student of what the new blocks do and why they help.",
    ),
});

export type AIFeedbackTopic = z.infer<typeof AIFeedbackTopicSchema>;
export type SubmitFeedbackResult = z.infer<typeof SubmitFeedbackSchema>;
export type InsertBlockToolInput = z.infer<typeof InsertBlockToolSchema>;
export type DeleteBlockToolInput = z.infer<typeof DeleteBlockToolSchema>;
export type FinishGenerateToolInput = z.infer<typeof FinishGenerateToolSchema>;
