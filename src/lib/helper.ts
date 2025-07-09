import OpenAI from "openai";
import { query } from "./db";

// Helper to parse and validate the aspect ratio
export function parseAspect(ratio: string | undefined): {
  width: number;
  height: number;
} {
  if (!ratio) throw new Error("Aspect ratio is undefined");
  const [w, h] = ratio.split("x").map(Number);
  if (!w || !h) throw new Error(`Invalid aspect ratio: '${ratio}'`);
  return { width: w, height: h };
}

// Helper to log into PollLog
export async function logPoll(status: string, count: number, errorMsg: string) {
  try {
    await query(
      `INSERT INTO "PollLog" (status, updatedcount, error)
             VALUES ($1, $2, $3)`,
      [status, count, errorMsg]
    );
  } catch (logErr) {
    console.error("[LOG_POLL_ERROR]", logErr);
  }
}

// --- Helper: Log errors in PollLog table ---
export async function logError({
  status,
  error,
}: {
  status: string;
  error: string;
}) {
  try {
    await query(
      `INSERT INTO "PollLog" (status, updatedcount, error) VALUES ($1, $2, $3)`,
      [status, 0, error]
    );
  } catch (logErr) {
    // Avoid breaking main flow if logging fails
    console.error("[POLL_LOG_INSERT_ERROR]", logErr);
  }
}

// Function spec for OpenAI function calling
export const functionSpec = [
  {
    type: "function" as const,
    function: {
      name: "generate_search_tags",
      description:
        "Extract 1 short search text and 3 tags, that capture ~90% of this prompt's essence for user find similar images",
      parameters: {
        type: "object",
        properties: {
          search_text: {
            type: "string",
            description:
              "A short search text that captures the essence of the prompt",
          },
          tags: {
            type: "array",
            items: { type: "string" },
            description:
              "A list of 3 tags that capture the essence of the prompt",
          },
        },
        required: ["search_text", "tags"],
      },
    },
  },
];

// Helper Function to generate image metadata
//--TODO: Add error to DB
export async function generateImageMetadata(
  prompt: string
): Promise<{ search_text: string; tags: string[] }> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY2! });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a search-text and tag generation assistant.",
      },
      { role: "user", content: prompt },
    ],
    tools: functionSpec,
    tool_choice: {
      type: "function" as const,
      function: { name: "generate_search_tags" },
    },
  });

  const toolCall = response.choices[0].message.tool_calls?.[0];
  const call = toolCall;

  if (!call?.function || !call.function.arguments) {
    throw new Error("Tag tool call failed or returned no arguments");
  }

  const { search_text, tags } = JSON.parse(call.function.arguments) as {
    search_text: string;
    tags: string[];
  };

  return { search_text, tags };
}
