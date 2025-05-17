"use server";

import { currentUser } from "@clerk/nextjs/server";
import { parseAspect } from "@/lib/helper";
import { query } from "@lib/db";
import { OpenAI } from "openai";
import { v2 as cloudinary } from "cloudinary";
import { AspectRatio } from "../context/HeaderContext";

type Aspect = "1024x1024" | "1024x1536" | "1536x1024";
interface GenerateImageParams {
  prompt: string;
  aspect?: Aspect;
  quality?: "low" | "medium" | "high" | "auto";
}

export interface ImageRecord {
  id: string;
  url: string;
  prompt: string;
  provider: string;
  status: string;
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
  // 1. Auth
  const user = await currentUser();
  if (!user?.id) {
    return { success: false, error: "User not authenticated" };
  }

  // 2. Prepare model call
  const { width, height } = parseAspect(aspect);
  const size = `${width}x${height}` as AspectRatio;
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  let imageBuffer: Buffer;
  try {
    // 3. Generate image with GPT Image
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size,
      quality,
    });
    const b64 = result.data?.[0]?.b64_json;
    if (!b64) {
      throw new Error("Base64 image data is undefined");
    }
    // Convert base64 string to buffer
    imageBuffer = Buffer.from(b64, "base64");
  } catch (err: any) {
    console.error("[OPENAI_IMAGE_ERROR]", err);
    return { success: false, error: err.message || "Image generation failed" };
  }

  // 4. Upload to Cloudinary
  let uploadRes: { secure_url: string };
  try {
    uploadRes = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "user_images", public_id: `${user.id}-${Date.now()}` },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as any);
        }
      );
      stream.end(imageBuffer);
    });
  } catch (err: any) {
    console.error("[CLOUDINARY_UPLOAD_ERROR]", err);
    return { success: false, error: "Cloudinary upload failed." };
  }

  // 5. Save completed record in DB
  try {
    const { rows } = await query(
      `INSERT INTO "Image" (prompt, provider, status, url, user_id, user_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, prompt, provider, status, url, createdat`,
      [
        prompt,
        "openai",
        "complete",
        uploadRes.secure_url,
        user.id,
        user.fullName,
      ]
    );
    return { success: true, image: rows[0] };
  } catch (dbErr: any) {
    console.error("[DB_INSERT_ERROR]", dbErr);
    return { success: false, error: "Database insert failed." };
  }
}
