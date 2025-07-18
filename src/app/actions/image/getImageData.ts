"use server";
import { query } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getImageData() {
  try {
    const { userId } = await auth();

    const { rows: images } = await query(`
        SELECT
        i.id,
        i.url,
        i.alt AS search_text,
        i.prompt,
        i.user_name   AS author,
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
      `);

    // Get like stats for each image
    const imagesWithLikes = (await Promise.all(
      images.map(async (image) => {
        const { rows: likeData } = await query(
          `SELECT * FROM get_image_like_status($1, $2)`,
          [image.id, userId]
        );

        return {
          ...image,
          initialLikeCount: likeData?.[0]?.like_count || 0,
          initialIsLiked: likeData?.[0]?.is_liked || false,
        };
      })
    )) as ImageExplorePage[];
    //console.log("data", imagesWithLikes);
    return { imagesWithLikes };
  } catch (error) {
    console.error("Error fetching images:", error);
    return { error: "Failed to load image data." };
  }
}
