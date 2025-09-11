"use server";

import { query } from "@/lib/db";
import { getCached, cacheResult } from "@/lib/redis";
import { auth } from "@clerk/nextjs/server";

interface GetPaginatedImagesResponse {
  images?: Image[];
  error?: string;
  hasMore?: boolean;
}

/**
 * Fetches paginated images associated with the currently authenticated user.
 * Supports caching and pagination with offset/limit.
 *
 * @param {number} limit - Number of images to return
 * @param {number} offset - Number of images to skip
 * @param {object} options - Optional parameters
 * @param {boolean} options.noCache - Bypass cache if true
 * @returns {Promise<GetPaginatedImagesResponse>} Response with images, error, and hasMore flag
 */
export async function getPaginatedImagesForUser(
  limit: number,
  offset: number,
  options?: { noCache?: boolean }
): Promise<GetPaginatedImagesResponse> {
  const noCache = options?.noCache ?? false;

  try {
    const { userId } = await auth();

    if (!userId) {
      console.log("No user signed in.");
      return { error: "User not authenticated." };
    }

    // Cache key includes pagination parameters
    const IMAGES_CACHE_KEY = `api:create:${userId}`;
    const CACHE_TTL = 60 * 1; // 1 minute in seconds

    // Try to get from cache first
    if (!noCache) {
      const cachedImagesString = await getCached<string>(IMAGES_CACHE_KEY);
      if (cachedImagesString) {
        const cachedImages = JSON.parse(cachedImagesString) as Image[];
        return {
          images: cachedImages,
          hasMore: cachedImages.length === limit, // Conservative estimate
        };
      }
    }

    // Query database with pagination
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
      ORDER BY i."createdat" DESC
      LIMIT $2 OFFSET $3
      `,
      [userId, limit, offset]
    );

    // Get total count to determine if there are more images
    const { rows: countRows } = await query(
      `SELECT COUNT(*) FROM "Image" WHERE user_id = $1`,
      [userId]
    );
    const totalCount = parseInt(countRows[0].count, 10);
    const hasMore = offset + limit < totalCount;

    // Cache the paginated results
    if (!noCache) {
      await cacheResult(IMAGES_CACHE_KEY, CACHE_TTL, JSON.stringify(images));
    }

    return {
      images,
      hasMore,
    };
  } catch (error) {
    console.error("[SERVER_ACTION_GET_PAGINATED_IMAGES_ERROR]", error);
    return { error: "Failed to load images." };
  }
}
