/** A single feedback topic with a short title and an expanded detail. */
export type AIFeedbackTopic = {
  title: string;
  detail: string;
};

/** Structured feedback for a Scratch remix. */
export type AIFeedback = {
  what_works_well: string;
  suggestions: AIFeedbackTopic[];
  logic_issues: AIFeedbackTopic[];
  error: string | undefined;
};
