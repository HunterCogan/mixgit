import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/dal";
import { parseScripts } from "@/lib/scratch";
import type { Script } from "@/types";
import { blockToLine } from "@/lib/scratch-pseudocode";

const client = new Anthropic();

function scriptsToPseudocode(scripts: Record<string, Script[]>): string {
  const sections: string[] = [];

  for (const [targetName, targetScripts] of Object.entries(scripts)) {
    if (targetScripts.length === 0) continue;
    const lines: string[] = [`Target: ${targetName}`];
    for (const script of targetScripts) {
      lines.push("");
      for (const block of script.blocks) {
        lines.push(`  ${blockToLine(block)}`);
      }
    }
    sections.push(lines.join("\n"));
  }

  return sections.join("\n\n");
}

export async function POST(req: NextRequest) {
  await verifySession();

  const { projectJsonData, remixName, remixDescription } = await req.json();

  if (!projectJsonData) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  let pseudocode: string;
  try {
    const scripts = parseScripts(projectJsonData);
    pseudocode = scriptsToPseudocode(scripts);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse project" },
      { status: 400 },
    );
  }

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 256,
    system:
      "You are a code reviewer for Scratch-style visual programming projects. Write all responses in plain text only — no bullet symbols, no asterisks. Keep feedback brief and to the point — 3 to 4 short paragraphs at most. You may use section headers by prefixing a line with ## followed by a space, for example: ## What Works Well",
    messages: [
      {
        role: "user",
        content: `Review this remix called "${remixName}" with description: "${remixDescription}".

${pseudocode}

Give constructive feedback covering what the code does well, suggestions for improvement, and any logic issues you notice. Keep it concise and friendly.`,
      },
    ],
  });

  const feedback =
    message.content[0].type === "text" ? message.content[0].text : "";

  return NextResponse.json({ feedback });
}
