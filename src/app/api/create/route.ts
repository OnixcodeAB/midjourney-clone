// app/api/create/route.ts
import { query } from "@/lib/db";
import { getCached, cacheResult } from "@/lib/redis";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  // Get the current user from Clerk
  const user = await currentUser();

  // Cache key and TTL constants
  const IMAGES_CACHE_KEY = `api:create:${user?.id}`;
  const CACHE_TTL = 60 * 5; // 5 minutes in seconds

  // Try to get from cache first
  const cachedImages = await getCached<any[]>(IMAGES_CACHE_KEY);
  if (cachedImages) {
    return NextResponse.json(cachedImages);
  }

  // If not in cache, query the database
  // and cache the result
  try {
    const { rows: images } = await query(
      `
      SELECT
        i.id,
        i.url,
        i.alt AS search_text,
        i.prompt,
        i.status,
        i.user_name   AS author,
        i.createdat,
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
      WHERE i.user_id = $1
      ORDER BY i."createdat" DESC;
    `,
      [user?.id]
    );

    // Cache the images for future requests
    await cacheResult(IMAGES_CACHE_KEY, CACHE_TTL, images);
    return NextResponse.json(images);
  } catch (error) {
    console.error("[API_CREATE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to load images" },
      { status: 500 }
    );
  }
}
