"use server";
import { env } from "node:process";
import OpenAI from "openai";
import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "crypto";
import dbPromise from "@/lib/db";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY2! });

export async function generateImageAndSave({
  prompt,
  aspect = "1024x1792",
}: {
  prompt: string;
  aspect?: "1024x1792" | "1024x1024" | "1792x1024";
}) {
  try {
    const db = await dbPromise;

    // 1. Generate image from OpenAI
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    });

    const openaiUrl = response.data[0]?.url;
    let openaiPrompt;
    if (response.data[0]?.revised_prompt) {
      openaiPrompt = response.data[0]?.revised_prompt;
    } else openaiPrompt = prompt;

    if (!openaiUrl) throw new Error("No image returned from OpenAI");

    // 2. Upload to Cloudinary
    const uploaded = await cloudinary.uploader.upload(openaiUrl, {
      folder: "ai_gallery",
    });

    // 3. Insert into SQLite
    const id = randomUUID();

    await db.run(
      `INSERT INTO Image (id, url, prompt, provider) VALUES (?, ?, ?, ?)`,
      [id, uploaded.secure_url, openaiPrompt, "openai"]
    );

    return {
      success: true,
      image: {
        id,
        url: uploaded.secure_url,
        prompt,
        provider: "openai",
      },
    };
  } catch (err) {
    console.error("[GENERATE_IMAGE_ERROR]", err);
    return { success: false, error: "Image generation failed." };
  }
}
