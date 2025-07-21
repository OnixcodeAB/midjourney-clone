import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  const { id, userId } = params; // Removed 'await' since params is not a promise


  try {
    const { rows: image } = await query(
      `SELECT 
         id, 
         url, 
         prompt, 
         user_name AS author 
       FROM "Image"
       WHERE id = $1`,
      [id]
    );

    if (!image || image.length === 0) {
      return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    // Get like stats for the image
    const {
      rows: [likeData],
    } = await query(`SELECT * FROM get_image_like_status($1, $2)`, [
      id,
      userId,
    ]);

    const responseData = {
      ...image[0],
      initialLikeCount: likeData?.like_count || 0,
      initialIsLiked: likeData?.is_liked || false,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("[GET_IMAGE_BY_ID_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}
