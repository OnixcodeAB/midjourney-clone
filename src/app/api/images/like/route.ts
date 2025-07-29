import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";
import { getAuth } from "@clerk/nextjs/server";
import { invalidateCache } from "@/lib/redis";

// Constants for cache keys
const IMAGES_CACHE_KEY = "explore:images";
const USER_LIKES_CACHE_PREFIX = "user:likes:";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      console.log("No user signed in.");
      return NextResponse.json(
        { error: "User not authenticated." },
        { status: 401 }
      );
    }

    const { imageId, action } = await req.json();

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required." },
        { status: 400 }
      );
    }

    // Query to toggle like status
    const { rows } = await query(`SELECT * FROM toggle_image_like($1, $2)`, [
      imageId,
      userId,
    ]);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Failed to toggle like status." },
        { status: 500 }
      );
    }

    // Invalidate relevant cache entries
    await Promise.all([
      // Invalidate the main images cahe
      invalidateCache(IMAGES_CACHE_KEY),
      //invalidate this user´s like status for this image
      invalidateCache(`${USER_LIKES_CACHE_PREFIX}${userId}:${imageId}`),
      // Invalidate all user likes for this image (if you want to be thorough)
      // This would require a pattern match, so we'd need to use Redis SCAN or KEYS
      // Note: Be careful with this in production as it can be expensive
      //invalidateCache(`${USER_LIKES_CACHE_PREFIX}*:${imageId}`),
    ]);

    return NextResponse.json({
      isLike: action === "like" ? true : false,
      likeCount: rows[0]?.like_count || 0,
    });
  } catch (error) {
    console.error("Error liking image:", error);
    return NextResponse.json(
      { error: "Failed to update image." },
      { status: 500 }
    );
  }
}
