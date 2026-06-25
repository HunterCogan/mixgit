import { appendFile, mkdir } from "fs/promises";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "feedback.jsonl");

export async function logFeedback(
  entry: Record<string, unknown>,
): Promise<void> {
  if (process.env.NODE_ENV === "production") return;

  try {
    await mkdir(LOG_DIR, { recursive: true });
    await appendFile(
      LOG_FILE,
      JSON.stringify({ ts: new Date().toISOString(), ...entry }) + "\n",
    );
  } catch (err) {
    console.error("Feedback log failed:", err);
  }
}
