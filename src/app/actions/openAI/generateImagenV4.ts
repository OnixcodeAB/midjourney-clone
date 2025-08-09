"use server";

import { currentUser } from "@clerk/nextjs/server";
import {
  fetchAsUploadable,
  generateImageMetadata,
  logError,
  parseAspect,
} from "@/lib/helper";
import { query } from "@lib/db";
import { OpenAI } from "openai";
import { toFile, Uploadable } from "openai/uploads";
import { v2 as cloudinary } from "cloudinary";
import { AspectRatio } from "../../context/HeaderContext";
import { checkUsageLimit } from "@/lib/usageLimits";
import { invalidateCache } from "@/lib/redis";

export interface ImageRecord {
  id: string;
  url: string;
  prompt: string;
  provider: string;
  status: string;
  createdat?: string;
}

export async function ImagenCreation({
  prompt,
  aspect,
  quality,
  mode = "generate",
  imageRefs,
  imagRefer,
  baseImageUrl,
  maskUrl,
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

  // 1) Auth
  const user = await currentUser();
  if (!user?.id) {
    return { success: false, error: "User not authenticated" };
  }

  // Normalize refs (support old param)
  const refs = (imageRefs ?? []).concat(imagRefer ?? []);

  // Check usage limits (quality only matters/counted for generate; reuse provided value otherwise)
  const limitCheck = await checkUsageLimit(user.id, quality ?? "low");
  if (!limitCheck.allowed) {
    return { success: false, error: limitCheck.error };
  }

  // Extract metadata from prompt
  const { search_text, tags } = await generateImageMetadata(prompt);

  // Insert pending DB row immediately
  const insertRes = await query(
    `INSERT INTO "Image" (prompt, provider, status, user_id, user_name, quality, progress_pct, alt)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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

  await invalidateCache(`api:create:${user.id}`);
  const imageId: string = insertRes.rows[0].id;

  // Upsert tags
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

  // 2) Prepare model call
  const { width, height } = parseAspect(aspect);
  const size = `${width}x${height}` as AspectRatio;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY2 });

  // Build inputs for modes 2 & 3
  let imageUploadables: Uploadable[] = [];
  let maskUploadable: Uploadable | undefined;

  try {
    if (mode === "reference") {
      if (!refs.length)
        throw new Error("At least one reference image URL is required.");
      // ⚠️ Hasta 16 imágenes para gpt-image-1
      imageUploadables = await Promise.all(
        refs.slice(0, 16).map((u, i) => fetchAsUploadable(u, `ref-${i + 1}`))
      );
    } else if (mode === "edit") {
      if (!baseImageUrl)
        throw new Error("baseImageUrl is required for edit mode.");
      if (!maskUrl) throw new Error("maskUrl is required for edit mode.");

      const baseFile = await fetchAsUploadable(baseImageUrl, "base");
      const extraRefs = refs?.length
        ? await Promise.all(
            refs
              .slice(0, 15)
              .map((u, i) => fetchAsUploadable(u, `ref-${i + 1}`))
          )
        : [];

      imageUploadables = [baseFile, ...extraRefs];
      maskUploadable = await fetchAsUploadable(maskUrl, "mask"); // PNG con alpha recomendado
    }
  } catch (prepErr: any) {
    await logError({
      status: "imageInputPrepFailed",
      error: prepErr.message ?? String(prepErr),
    });
    return {
      success: false,
      error: prepErr.message ?? "Failed to prepare input images/mask.",
    };
  }

  // 3) Call OpenAI
  let imageBuffer: Buffer;
  try {
    if (mode === "generate") {
      // Text -> Image
      const result = await openai.images.generate({
        model: "gpt-image-1",
        prompt,
        size,
        // quality is supported for generate; omit for edit
        ...(quality ? { quality } : {}),
      });
      const b64 = result.data?.[0]?.b64_json;
      if (!b64) throw new Error("Base64 image data is undefined (generate).");
      imageBuffer = Buffer.from(b64, "base64");
    } else if (mode === "reference") {
      // Create a NEW image guided by references (no mask)
      const result = await openai.images.edit({
        model: "gpt-image-1",
        // up to 10 images, combine/look-and-feel guided by prompt
        image: imageUploadables,
        prompt,
        size,
      });
      const b64 = result.data?.[0]?.b64_json;
      if (!b64) throw new Error("Base64 image data is undefined (reference).");
      imageBuffer = Buffer.from(b64, "base64");
    } else {
      // mode === "edit" : Inpainting with mask
      const result = await openai.images.edit({
        model: "gpt-image-1",
        image: imageUploadables, // mask applies to the FIRST provided image
        mask: maskUploadable!,
        prompt, // describe the full desired output, not just the masked area
        size,
      });
      const b64 = result.data?.[0]?.b64_json;
      if (!b64) throw new Error("Base64 image data is undefined (edit).");
      imageBuffer = Buffer.from(b64, "base64");
    }
  } catch (err: any) {
    console.error("[OPENAI_IMAGE_ERROR]", err);
    await logError({
      status: "imageGenFailed",
      error: err.message || "Image generation failed",
    });
    return { success: false, error: err.message || "Image generation failed" };
  }

  // 4) Upload to Cloudinary
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
    await logError({
      status: "cloudinaryUploadFailed",
      error: err.message || "Cloudinary upload failed.",
    });
    return { success: false, error: "Cloudinary upload failed." };
  }

  // 5) Finalize DB
  try {
    const updateRes = await query(
      `UPDATE "Image"
         SET status = $1, url = $2
       WHERE id = $3
       RETURNING id, prompt, provider, status, url, createdat`,
      ["complete", uploadRes.secure_url, imageId]
    );
    await invalidateCache(`api:create:${user.id}`);
    return { success: true, image: updateRes.rows[0] };
  } catch (dbErr: any) {
    console.error("[DB_INSERT_ERROR]", dbErr);
    await logError({
      status: "dbUpdateFailed",
      error: dbErr.message || "Database update failed.",
    });
    return { success: false, error: "Database update failed." };
  }
}
