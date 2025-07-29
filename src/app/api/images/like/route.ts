import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";
import { getAuth } from "@clerk/nextjs/server";
import { invalidateCache } from "@/lib/redis";

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

    //await invalidateCache(`api:create:${user.id}`);

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
