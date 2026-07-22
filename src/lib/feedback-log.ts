import { appendFile, mkdir } from "fs/promises";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "feedback.jsonl");

const DEFAULT_MODEL = "claude-sonnet-5";

type AnthropicUsage = {
  input_tokens?: number;
  output_tokens?: number;
  cache_read_input_tokens?: number;
  output_tokens_details?: { thinking_tokens?: number };
};

function slimUsage(usage: AnthropicUsage) {
  return {
    in: usage.input_tokens,
    out: usage.output_tokens,
    cacheRead: usage.cache_read_input_tokens || undefined,
    thinking: usage.output_tokens_details?.thinking_tokens || undefined,
  };
}

export async function logFeedback(
  entry: Record<string, unknown>,
): Promise<void> {
  if (process.env.NODE_ENV === "production") return;

  const normalized = entry.usage
    ? { ...entry, usage: slimUsage(entry.usage as AnthropicUsage) }
    : entry;

  try {
    await mkdir(LOG_DIR, { recursive: true });
    await appendFile(
      LOG_FILE,
      JSON.stringify({ ts: new Date().toISOString(), ...normalized }) + "\n",
    );
  } catch (err) {
    console.error("Feedback log failed:", err);
  }
}

export type LogAiEventArgs = {
  kind: "feedback" | "generate";
  remixId: string;
  remixName: string;
  started: number;
  model?: string;
  usage?: unknown;
  stopReason?: string | null;
} & Record<string, unknown>;

export async function logAiEvent({
  kind,
  remixId,
  remixName,
  started,
  model = DEFAULT_MODEL,
  usage,
  stopReason,
  ...extra
}: LogAiEventArgs): Promise<void> {
  await logFeedback({
    kind,
    remixId,
    remixName,
    model,
    ...(usage !== undefined ? { usage } : {}),
    ...(stopReason !== undefined ? { stopReason } : {}),
    latencyMs: Date.now() - started,
    ...extra,
  });
}
