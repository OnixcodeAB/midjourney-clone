"use server";
import { randomUUID } from "crypto";
import dbPromise, { query } from "@lib/db";

// Function to poll the Sora API for task completion
// until the task is either completed or times out.

/// Function to generate an image using Sora API and save it to Cloudinary and DB
export async function generateImageAndSave({
  prompt,
  aspect = "1024x1024",
}: {
  prompt: string;
  aspect?: "1024x1024" | "1024x1792" | "1792x1024";
}) {
  try {
    const db = await dbPromise;
    const id = randomUUID();

    // 1. Kick off Sora image generation
    const postRes = await fetch("https://sora.chatgpt.com/backend/video_gen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SORA_API_TOKEN}`,
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        "Openai-Sentinel-Token": process.env.SORA_SENTINEL_TOKEN || "",
      },
      body: JSON.stringify({
        type: "image_gen",
        height: 720,
        width: 480,
        inpaint_items: [],
        n_frames: 1,
        n_variants: 1,
        operation: "simple_compose",
        prompt,
        tag: "image_gen",
      }),
    });
    const postData = await postRes.json();
    const taskId = postData.id;

    if (!taskId) throw new Error("No task ID returned from Sora.");

    // 2. Insert pending record in SQLite (url is null for now)
    await query(
      `INSERT INTO "Image" (prompt, provider, status, task_id)
       VALUES ($1, $2, $3, $4 )`,
      [prompt, "sora", "pending", taskId]
    );

    //2.1 ✅ Trigger cron immediately (non-blocking fire & forget)
    await fetch("http://localhost:3000/api/poll-tasks").catch((err) =>
      console.error("[TRIGGER ERROR]", err)
    );

    // 3. Immediately return pending result
    return {
      success: true,
      image: {
        id,
        url: null, // still pending
        prompt,
        status: "pending",
        provider: "sora",
      },
    };
  } catch (err) {
    console.error("[GENERATE_IMAGE_ERROR]", err);
    return { success: false, error: "Image generation failed." };
  }
}
