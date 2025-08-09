import OpenAI from "openai";
import { toFile, Uploadable } from "openai/uploads";
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

// Function to split data into columns for layout
export function splitIntoColumns<T>(data: T[], columns: number): T[][] {
  const result: T[][] = Array.from({ length: columns }, () => []);
  data.forEach((item, index) => {
    result[index % columns].push(item);
  });
  return result;
}

type ImgMime = "image/png" | "image/jpeg" | "image/webp";

const EXT_TO_MIME: Record<string, ImgMime> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export function decideMimeAndExt(from: { header?: string; url?: string }): { mime: ImgMime; ext: keyof typeof EXT_TO_MIME } {
  const h = (from.header || "").toLowerCase();
  if (h.includes("image/png"))  return { mime: "image/png",  ext: "png"  };
  if (h.includes("image/jpeg")) return { mime: "image/jpeg", ext: "jpg"  };
  if (h.includes("image/webp")) return { mime: "image/webp", ext: "webp" };

  const u = (from.url || "").toLowerCase();
  if (u.endsWith(".png"))  return { mime: "image/png",  ext: "png"  };
  if (u.endsWith(".jpg") || u.endsWith(".jpeg")) return { mime: "image/jpeg", ext: "jpg" };
  if (u.endsWith(".webp")) return { mime: "image/webp", ext: "webp" };

  // safe default
  return { mime: "image/png", ext: "png" };
}

export async function fetchAsUploadable(url: string, nameBase = "img", forcePng = false): Promise<Uploadable> {
  // data URL path
  if (url.startsWith("data:")) {
    const m = /^data:(image\/(png|jpeg|webp));base64,(.*)$/i.exec(url);
    const mime = (m?.[1]?.toLowerCase() as ImgMime | undefined) ?? "image/png";
    const ext: keyof typeof EXT_TO_MIME = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
    if (forcePng && mime !== "image/png") throw new Error("Mask must be a PNG (data URL is not PNG).");

    const b64 = m?.[3] ?? "";
    const buf = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    return toFile(new Blob([buf], { type: mime }), `${nameBase}.${ext}`);
  }

  // normal URL path
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${url}`);

  // Use the server-provided MIME when possible
  const headerType = res.headers.get("content-type") || undefined;
  const blob = await res.blob(); // this preserves the MIME for us
  const contentType = (blob.type || headerType || "").toLowerCase();

  // Decide final mime/ext
  let { mime, ext } = decideMimeAndExt({ header: contentType, url });

  if (forcePng) {
    // Do NOT spoof: ensure the blob is actually PNG
    if (contentType !== "image/png") {
      throw new Error("Mask must be a real PNG with alpha (server did not return image/png).");
    }
    mime = "image/png";
    ext = "png";
  }

  // If blob.type was empty, rebuild a blob with the correct MIME so FormData sets it properly
  const finalBlob = contentType ? blob : new Blob([await blob.arrayBuffer()], { type: mime });
  //console.log({finalBlob})

  // Some runtimes lose File.type on inspection; the SDK reads Blob.type at append-time
  const file = await toFile(finalBlob, `${nameBase}.${ext}`, { type: mime });
  //console.log(file)
  return file;
}
