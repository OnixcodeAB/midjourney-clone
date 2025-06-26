"use server";
import { currentUser } from "@clerk/nextjs/server";
import { logPoll, parseAspect } from "@/lib/helper";
import { query } from "@lib/db";
import { toast } from "sonner";

// Allowed aspect ratios
type Aspect = "1024x1024" | "1024x1536" | "1536x1024";
interface GenerateImageParams {
  prompt: string;
  aspect?: Aspect;
  quality?: string;
}

export interface ImageRecord {
  id: string;
  url: string;
  prompt: string;
  provider: string;
  task_id: string;
  status: string;
  progress_pct: number;
  createdat?: string;
}

export async function generateImageAndSave({
  prompt,
  aspect,
  quality,
}: GenerateImageParams): Promise<{
  success: boolean;
  image?: ImageRecord;
  error?: string;
}> {
  const user = await currentUser();
  const { id, fullName } = user || {};
  if (!id) {
    toast.error("User not authenticated", {
      description: "Please sign in to generate an image.",
    });
    return { success: false, error: "User not authenticated" };
  }

  // 1. Call Sora API
  let taskId: string;
  try {
    // Parse the aspect ratio
    const { width, height } = parseAspect(aspect);

    const response = await fetch("https://sora.chatgpt.com/backend/video_gen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SORA_API_TOKEN}`,
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        "Openai-Sentinel-Token": process.env.SORA_SENTINEL_TOKEN || "",
      },
      body: JSON.stringify({
        type: "image_gen",
        width,
        height,
        inpaint_items: [],
        n_frames: 1,
        n_variants: 1,
        operation: "simple_compose",
        prompt,
        tag: "image_gen",
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Sora API responded ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    if (!data.id) {
      throw new Error("No task ID returned from Sora API.");
    }
    taskId = data.id;
  } catch (apiErr: any) {
    console.error("[SORA_API_ERROR]", apiErr);
    await logPoll("generateImageFailed", 0, apiErr.message);
    return { success: false, error: apiErr.message };
  }

  // 2. Insert pending record in DB
  let inserted: ImageRecord;
  try {
    const { rows } = await query(
      `INSERT INTO "Image" (prompt, provider, status, task_id, user_id, user_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, prompt, provider, status, task_id, createdat, user_id, user_name`,
      [prompt, "sora", "pending", taskId, id, fullName]
    );
    inserted = rows[0];
  } catch (dbErr: any) {
    console.error("[DB_INSERT_ERROR]", dbErr);
    await logPoll("dbInsertFailed", 0, dbErr.message);
    return { success: false, error: "Database insert failed." };
  }

  // 3. Trigger background polling (fire-and-forget)
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    console.log("baseUrl", baseUrl);
    const Url = new URL("/api/poll-tasks", baseUrl).toString();
    console.log("Url", Url);
    fetch(Url).catch((err) => console.error("[TRIGGER_ERROR]", err));
  } catch (err) {
    console.error("[TRIGGER_ERROR] invalid base URL", err);
  }

  // 4. Return the pending image record
  return { success: true, image: inserted };
}
