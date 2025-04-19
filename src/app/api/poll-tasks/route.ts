// src/app/api/poll-tasks/route.ts
import { NextResponse } from "next/server";
import WebSocket from "ws";
import dbPromise from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "crypto";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Helper function to send message to external WebSocket
async function sendWebSocketMessage(message: any) {
  return new Promise<void>((resolve, reject) => {
    const socket = new WebSocket("ws://localhost:5000/ws");

    socket.on("open", () => {
      socket.send(JSON.stringify(message));
      socket.close();
      resolve();
    });

    socket.on("error", (err) => {
      console.error("[WebSocket Error]:", err);
      reject(err);
    });
  });
}

// Polling interval (in milliseconds)
let lastPollTime = 0;

export async function GET() {
  // Check if the last poll was less than 30 seconds ago
  const now = Date.now();
  if (now - lastPollTime < 25000) {
    return NextResponse.json(
      { message: "Cooldown in effect" },
      { status: 429 }
    );
  }

  const db = await dbPromise;

  const pendingTasks = await db.all(
    `SELECT id, task_id FROM Image WHERE status = 'pending' AND task_id IS NOT NULL`
  );

  const endpoint = `https://sora.chatgpt.com/backend/video_gen`;
  const updated: string[] = [];

  for (const task of pendingTasks) {
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

      // Optional: update progress
      if (typeof taskData?.progress_pct === "number") {
        const dbResponse = await db.run(
          `UPDATE Image SET progress_pct = ? WHERE id = ?`,
          [taskData.progress_pct, task.id]
        );

        // Broadcast progress to WebSocket clients
        await sendWebSocketMessage({
          type: "image_update",
          imageId: task.id,
          url: taskData.generations?.[0]?.url ?? "",
          status: task.status ?? "running",
          progress_pct: taskData.progress_pct,
        });
        await sendWebSocketMessage({
          type: "image_update",
          imageId: task.id,
          url: taskData.generations?.[0]?.url ?? "",
          status: task.status ?? "running",
          progress_pct: taskData.progress_pct,
        });
      }

      // If complete, upload to Cloudinary and update
      if (taskData?.status === "succeeded") {
        const finalUrl = taskData.generations?.[0]?.url;
        if (!finalUrl) continue;

        const uploaded = await cloudinary.uploader.upload(finalUrl, {
          folder: "ai_gallery",
        });

        await db.run(
          `UPDATE Image SET url = ?, status = 'complete', prompt = ? WHERE id = ?`,
          [uploaded.secure_url, taskData.prompt, task.id]
        );

        // Broadcast completion to WebSocket clients
        await sendWebSocketMessage({
          type: "image_update",
          imageId: task.id,
          url: uploaded.secure_url ?? "",
          status: "complete",
          progress_pct: taskData.progress_pct,
        });

        updated.push(task.id);

        await db.run(
          `INSERT INTO PollLog (id, triggeredAt, status, updatedCount, error) VALUES (?, ?, ?, ?, ?)`,
          [
            randomUUID(),
            new Date().toISOString(),
            "success",
            updated.length,
            null,
          ]
        );
      }
    } catch (err) {
      console.error("Polling failed for task:", task.taskId, err);
      await db.run(
        `INSERT INTO PollLog (id, triggeredAt, status, updatedCount, error) VALUES (?, ?, ?, ?, ?)`,
        [
          randomUUID(),
          new Date().toISOString(),
          "failed",
          0,
          (err as Error).message,
        ]
      );
    }
  }

  return NextResponse.json({
    status: pendingTasks.length > 0 ? "running" : "complete",
    updated,
    checked: pendingTasks.length,
  });
}
