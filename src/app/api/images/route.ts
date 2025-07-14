// src/app/api/images/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cacheResult, getCached } from "@/lib/redis";

// Cache key and TTL constants
const IMAGES_CACHE_KEY = "api:images:all";
const CACHE_TTL = 60 * 10; // 10 minutes in seconds

export async function GET() {
  // Try to get from cache first
  const cachedImages = await getCached<any[]>(IMAGES_CACHE_KEY);
  if (cachedImages) {
    return NextResponse.json(cachedImages);
  }
  // If not in cache, query the database
  // and cache the result
  try {
    const { rows: images } = await query(`
      SELECT
        i.id,
        i.url,
        i.alt AS search_text,
        i.prompt      AS description,
        i.user_name   AS author,
        i.like_count AS likes,
        COALESCE(
          (
            SELECT array_agg(t.name)
            FROM "Image_Tag" it
            JOIN "Tag"        t  ON t.id = it.tag_id
            WHERE it.image_id = i.id
          ),
          '{}'
        )               AS tags
      FROM "Image" i
      WHERE i.public = true
      ORDER BY i."createdat" DESC;
    `);
    // Cache the result
    await cacheResult(IMAGES_CACHE_KEY, CACHE_TTL, images);
    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Failed to load images" },
      { status: 500 }
    );
  }
}
