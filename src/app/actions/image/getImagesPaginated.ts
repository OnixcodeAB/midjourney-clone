"use server";
import { query } from "@/lib/db";

export async function getImagesPaginated(
  userId: string | null,
  limit: number,
  offset: number
) {
  try {
    const { rows: images } = await query(
      `SELECT
        i.id,
        i.url,
        i.alt AS search_text,
        i.prompt,
        i.user_name   AS author,
        i.like_count AS likes,
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
      WHERE i.public = true
      ORDER BY i.id DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    if (!images || images.length === 0) {
      return { message: "No more images" };
    }

    // Obtener estadísticas de likes para cada imagen
    const imagesWithLikes = await Promise.all(
      images.map(async (image) => {
        const {
          rows: [likeData],
        } = await query(`SELECT * FROM get_image_like_status($1, $2)`, [
          image.id,
          userId,
        ]);

        return {
          ...image,
          initialLikeCount: likeData?.like_count || 0,
          initialIsLiked: likeData?.is_liked || false,
        };
      })
    );

    return { data: imagesWithLikes };
  } catch (error) {
    console.error("[GET_IMAGES_PAGINATED_ERROR]", error);
    return { error: "Failed to fetch images" };
  }
}
