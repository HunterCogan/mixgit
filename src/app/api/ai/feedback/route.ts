import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/dal";
import { parseScripts } from "@/lib/scratch";
import type { Script } from "@/types";
import { blockToLine } from "@/lib/scratch-pseudocode";
import { computeIndents } from "@/lib/scratch-pseudocode";

const client = new Anthropic();

function scriptsToPseudocode(scripts: Record<string, Script[]>): string {
  const sections: string[] = [];

  for (const [targetName, targetScripts] of Object.entries(scripts)) {
    if (targetScripts.length === 0) continue;
    const lines: string[] = [`Target: ${targetName}`];
    for (const script of targetScripts) {
      lines.push("");
      const indents = computeIndents(script.blocks);
      for (const [i, block] of script.blocks.entries()) {
        lines.push(`${"  ".repeat(indents[i])}${blockToLine(block)}`);
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
    pseudocode = projectJsonData;
  }

  if (!pseudocode) {
    return NextResponse.json(
      { error: "Failed to parse project" },
      { status: 400 },
    );
  }

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 700,
    system: `The code is pseudocode from Scratch blocks, or it is a different file like HTML, JavaScript, or Python, converted into text form.
      Give constructive feedback covering what the code does well with 1 sentence, suggestions for improvement 2 sentences, 
      and any logic issues you notice with 1 or 2 sentences. 
      Keep it concise and friendly.
      If a block is incomplete or unclear, do your best to interpret the user's intent and provide feedback based on that.
      You may use section headers by prefixing a line with #### followed by a space, for example: 
      #### What Works Well. Make sure there is only 1 space after a header.
      Always write complete sentences and always finish your final paragraph before stopping.
      Add 2 lines of spacing between paragraphs.
      Max 250 tokens. The user is a 5th to 8th grade student, so keep language simple and concise.
      Use ticks for code snippets, for example: \`move (10) steps\`.
      `,
    messages: [
      {
        role: "user",
        content: `Review this remix called "${remixName}" with description: "${remixDescription}".
This is the code to review:
${pseudocode}
`,
      },
    ],
  });

  const feedback =
    message.content[0].type === "text" ? message.content[0].text : "";

  return NextResponse.json({ feedback });
}
