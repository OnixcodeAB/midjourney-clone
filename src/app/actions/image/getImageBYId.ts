"use server";

import { query } from "@/lib/db";

export async function getImageById(id: string, userId: string) {
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
      return { message: "Not Found", status: 404 };
    }

    // Get like stats for the image
    const {
      rows: [likeData],
    } = await query(`SELECT * FROM get_image_like_status($1, $2)`, [
      id,
      userId,
    ]);

    return {
      data: {
        ...image[0],
        initialLikeCount: likeData?.like_count || 0,
        initialIsLiked: likeData?.is_liked || false,
      },
      status: 200,
    };
  } catch (error) {
    console.error("[GET_IMAGE_BY_ID_ERROR]", error);
    return { error: "Failed to fetch image", status: 500 };
  }
}
