"use server";

import { currentUser } from "@clerk/nextjs/server";
import { generateImageMetadata, logError, parseAspect } from "@/lib/helper";
import { query } from "@lib/db";
import { OpenAI } from "openai";
import { v2 as cloudinary } from "cloudinary";
import { AspectRatio } from "../context/HeaderContext";
import { checkUsageLimit } from "@/lib/usageLimits";
import { invalidateCache } from "@/lib/redis";

type Aspect = "1024x1024" | "1024x1536" | "1536x1024";
interface GenerateImageParams {
  prompt: string;
  aspect?: Aspect;
  quality?: QualityType;
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
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  });

  // 1. Auth
  const user = await currentUser();
  if (!user?.id) {
    return { success: false, error: "User not authenticated" };
  }

  // Check usage limits
  const limitCheck = await checkUsageLimit(user.id, quality ?? "low");

  if (!limitCheck.allowed) {
    return { success: false, error: limitCheck.error };
  }

  // Extract metadata from prompt
  const { search_text, tags } = await generateImageMetadata(prompt);

  // Insert the pending record in DB inmediately
  const insertRes = await query(
    `INSERT INTO "Image" (prompt, provider, status, user_id, user_name, quality, progress_pct, alt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
    [
      prompt,
      "openai",
      "pending",
      user.id,
      user.fullName,
      quality,
      0.3,
      search_text,
    ]
  );

  await invalidateCache(`api:create:all`);

  const imageId: string = insertRes.rows[0].id;

  // Upsert tags into DB and link to image
  for (const tag of tags) {
    const tagRes = await query(
      `INSERT INTO "Tag" (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING id`,
      [tag]
    );

    const tagId: string =
      tagRes.rows[0]?.id ??
      (await query(`SELECT id FROM "Tag" WHERE name = $1`, [tag])).rows[0].id;

    await query(
      `INSERT INTO "Image_Tag" (image_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [imageId, tagId]
    );
  }

  // 2. Prepare model call
  const { width, height } = parseAspect(aspect);
  const size = `${width}x${height}` as AspectRatio;
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY2,
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

    // Log error in PollLog
    await logError({
      status: "imageGenFailed",
      error: err.message || "Image generation failed",
    });

    return { success: false, error: err.message || "Image generation failed" };
  }

  // 4. Upload to Cloudinary
  let uploadRes: { secure_url: string };
  try {
    uploadRes = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "ai_gallery", public_id: `${user.id}-${Date.now()}` },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as any);
        }
      );
      stream.end(imageBuffer);
    });
  } catch (err: any) {
    console.error("[CLOUDINARY_UPLOAD_ERROR]", err);

    // Log error in PollLog
    await logError({
      status: "cloudinaryUploadFailed",
      error: err.message || "Cloudinary upload failed.",
    });

    return { success: false, error: "Cloudinary upload failed." };
  }

  // 5. Update the same row to completed in DB
  try {
    const updateRes = await query(
      `UPDATE  "Image" 
         SET status = $1, url = $2
       WHERE id = $3
       RETURNING id, prompt, provider, status, url, createdat`,
      ["complete", uploadRes.secure_url, imageId]
    );
    return { success: true, image: updateRes.rows[0] };
  } catch (dbErr: any) {
    console.error("[DB_INSERT_ERROR]", dbErr);

    // Log error in PollLog
    await logError({
      status: "dbUpdateFailed",
      error: dbErr.message || "Database update failed.",
    });
    return { success: false, error: "Database update failed." };
  }
}
