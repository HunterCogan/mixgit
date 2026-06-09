import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/dal";
import type { AIFeedback } from "@/types";
import { feedbackTool } from "@/lib/anthropic";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  await verifySession();

  const { projectJsonData, remixName, remixDescription } = await req.json();

  if (!projectJsonData) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 700,
    tools: [feedbackTool],
    tool_choice: { type: "tool", name: "submit_feedback" },
    system: [
      {
        type: "text",
        text: `
    You are an export Scratch mentor for young learners.
    You are given the project.json file of a remix. 
    You provide constructive feedback that is friendly and enthusiastic.
    You can use markdown for code snippets, bold, italics, etc.
    Your language can be understood by young learners, and you keep sentences consise.
    You do not include emojis in your feedback.
    `,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `
        Remix Name: "${remixName}"
        Remix Description: "${remixDescription}"
        project.json: ${projectJsonData}
        `,
      },
    ],
  });

  const toolUse = message.content.find((b) => b.type === "tool_use");
  const feedback = toolUse?.input as AIFeedback;

  return NextResponse.json({ feedback });
}
