"use server";
import { query } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { getCached, cacheResult } from "@/lib/redis";

// Cache configuration
const CACHE_TTL = 60 * 5; // 5 minutes
const IMAGES_CACHE_KEY = "explore:images";
const USER_LIKES_CACHE_PREFIX = "user:likes:";

export async function getImageData(): Promise<{
  imagesWithLikes?: ImageExplorePage[];
  error?: string;
}> {
  try {
    const { userId } = await auth();

    // Try to get cached images
    const cachedImages = await getCached<ImageExplorePage[]>(IMAGES_CACHE_KEY);

    let images: any[];
    if (cachedImages) {
      images = cachedImages;
    } else {
      // Fetch from database if not in cache
      const { rows: dbImages } = await query(`
        SELECT
          i.id,
          i.url,
          i.alt AS search_text,
          i.prompt,
          i.user_name AS author,
          i.like_count AS likes,
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
        WHERE i.public = true
        ORDER BY i."createdat" DESC
        LIMIT 15
      `);
      images = dbImages;
      // Cache the images
      await cacheResult(IMAGES_CACHE_KEY, CACHE_TTL, images);
    }

    // Get like stats for each image
    const imagesWithLikes = (await Promise.all(
      images.map(async (image) => {
        const userLikeCacheKey = `${USER_LIKES_CACHE_PREFIX}${userId}:${image.id}`;
        const cachedLikeData = await getCached<any>(userLikeCacheKey);

        if (cachedLikeData) {
          return {
            ...image,
            initialLikeCount: cachedLikeData.like_count || 0,
            initialIsLiked: cachedLikeData.is_liked || false,
          };
        }

        // Fetch from database if not in cache
        const { rows: likeData } = await query(
          `SELECT * FROM get_image_like_status($1, $2)`,
          [image.id, userId]
        );

        const likeStatus = {
          like_count: likeData?.[0]?.like_count || 0,
          is_liked: likeData?.[0]?.is_liked || false,
        };

        // Cache the like status with a shorter TTL since this is user-specific
        await cacheResult(userLikeCacheKey, CACHE_TTL / 2, likeStatus);

        return {
          ...image,
          initialLikeCount: likeStatus.like_count,
          initialIsLiked: likeStatus.is_liked,
        };
      })
    )) as ImageExplorePage[];

    return { imagesWithLikes };
  } catch (error) {
    console.error("Error fetching images:", error);
    return { error: "Failed to load image data." };
  }
}
