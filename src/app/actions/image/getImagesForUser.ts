"use server";

import { query } from "@/lib/db";
import { getCached, cacheResult } from "@/lib/redis";
import { auth } from "@clerk/nextjs/server";

interface GetImagesResponse {
  images?: Image[];
  error?: string;
}

/**
 * Fetches images associated with the currently authenticated user.
 * It first attempts to retrieve images from the cache (Redis).
 * If not found in cache, it queries the database, caches the result, and returns it.
 *
 * @returns {Promise<GetImagesResponse>} An object containing an array of images or an error message.
 */
export async function getImagesForUser(): Promise<GetImagesResponse> {
  try {
    // Get the current user from Clerk
    const { userId } = await auth();

    if (!userId) {
      console.log("No user signed in.");
      return { error: "User not authenticated." };
    }
    console.log(`Fetching images for user: ${userId}`);

    // Cache key and TTL constants
    const IMAGES_CACHE_KEY = `api:create:${userId}`;
    const CACHE_TTL = 60 * 1; // 1 minute in seconds

    // Try to get from cache first
    const cachedImagesString = await getCached<string>(IMAGES_CACHE_KEY);
    if (cachedImagesString) {
      const cachedImages = JSON.parse(cachedImagesString) as Image[];
      return { images: cachedImages };
    }

    // If not in cache, query the database
    const { rows: images } = await query(
      `
      SELECT
        i.id,
        i.url,
        i.alt AS search_text,
        i.prompt,
        i.progress_pct,
        i.status,
        i.user_name AS author,
        i.createdat,
        COALESCE(
          (
            SELECT array_agg(t.name)
            FROM "Image_Tag" it
            JOIN "Tag" t ON t.id = it.tag_id
            WHERE it.image_id = i.id
          ),
          '{}'
        ) AS tags
      FROM "Image" i
      WHERE i.user_id = $1
      ORDER BY i."createdat" DESC;
      `,
      [userId]
    );

    /* console.log(
      `Images fetched from database for user: ${userId}. Count: ${images.length}`
    ); */

    // Cache the images for future requests
    await cacheResult(IMAGES_CACHE_KEY, CACHE_TTL, JSON.stringify(images));
    console.log(`Images cached for user: ${userId}`);

    return { images };
  } catch (error) {
    console.error("[SERVER_ACTION_GET_IMAGES_ERROR]", error);
    // Return an error object to the client
    return { error: "Failed to load images." };
  }
}
