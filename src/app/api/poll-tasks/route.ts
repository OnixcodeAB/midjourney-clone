import { NextResponse } from "next/server";
import dbPromise, { query } from "@lib/db";
import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "crypto";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Polling interval (in milliseconds)
const POLLING_INTERVAL = 25000; // 25 seconds
const MAX_POLLING_DURATION = 120000; // 2 minutes

export async function GET() {
  const db = await dbPromise;

  const { rows: pendingTasks } = await query(
    `SELECT id, task_id FROM "Image" WHERE status = 'pending' AND task_id IS NOT NULL`
  );

  const endpoint = `https://sora.chatgpt.com/backend/video_gen`;
  const updated: string[] = [];

  // Create an array of promises for each task
  const taskPromises = pendingTasks.map(async (task) => {
    let taskCompleted = false;
    const startTime = Date.now(); // Record the start time

    while (!taskCompleted) {
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime > MAX_POLLING_DURATION) {
        console.warn(`Polling timed out for task: ${task.task_id}`);
        break; // Exit the loop if the timeout is reached
      }

      try {
        const res = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${process.env.SORA_API_TOKEN}`,
            "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
            limit: "100",
            before: `${task.task_id}`,
          },
        });

        const data = await res.json();
        const taskData = data.task_responses.find(
          (t: any) => t.id === task.task_id
        );

        // Update progress if available
        if (typeof taskData?.progress_pct === "number") {
          await query(`UPDATE "Image" SET progress_pct = $1 WHERE id = $2`, [
            taskData.progress_pct,
            task.id,
          ]);
        }

        // If complete, upload to Cloudinary and update
        if (taskData?.status === "succeeded") {
          const finalUrl = taskData.generations?.[0]?.url;
          if (!finalUrl) continue;

          const uploaded = await cloudinary.uploader.upload(finalUrl, {
            folder: "ai_gallery",
          });

          await query(
            `UPDATE "Image" 
             SET url = $1, status = 'complete', prompt = $2 
             WHERE id = $3`,
            [uploaded.secure_url, taskData.prompt, task.id]
          );

          updated.push(task.id);
          taskCompleted = true; // Mark task as completed
        } else {
          // Wait for the polling interval before checking again
          await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
        }
      } catch (err) {
        console.error("Polling failed for task:", task.task_id, err);
        break; // Exit the loop on error
      }
    }
  });

  // Wait for all tasks to complete
  await Promise.all(taskPromises);

  return NextResponse.json({
    status: pendingTasks.length > 0 ? "running" : "complete",
    updated,
    checked: pendingTasks.length,
  });
}
