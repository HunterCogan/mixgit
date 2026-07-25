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
};

/**
 * Status of an AI feedback request:
 * - checking: looking up whether feedback was already saved for this Remix
 * - idle: not requested yet
 * - loading: request in flight
 * - ready: feedback returned and available
 * - empty: request succeeded but the model had nothing to review
 * - error: request failed
 */
export type FeedbackStatus =
  | "checking"
  | "idle"
  | "loading"
  | "ready"
  | "empty"
  | "error";
