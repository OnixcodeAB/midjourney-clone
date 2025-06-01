"use server";

import { getAuth, currentUser } from "@clerk/nextjs/server";
import { query } from "@/lib/db";
import { invalidateCache } from "@/lib/redis";

export async function addFolderItem(
  folderId: string,
  itemData: {
    image_id: string;
    image_title: string;
    url: string;
    type: string;
  }
) {
  const user = await currentUser();
  const { image_id, image_title, url, type } = itemData;

  if (!user?.id) {
    return { error: "Not authorized" };
  }

  if (!image_id || !image_title || !url || !type) {
    return { error: "Invalid item data" };
  }

  try {
    const { rows } = await query(
      `INSERT INTO "FolderItem" (image_id, image_title, url, type, folder_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [image_id, image_title, url, type, folderId]
    );

    const newItem: FolderItem = rows[0];

    if (!newItem) {
      return { error: "Failed to add item" };
    }

    // Invalidate cache for the folder items
    await invalidateCache(`folder_items_${folderId}`);

    return { success: true, item: newItem };
  } catch (error) {
    console.error("Error adding item to folder:", error);
    return { error: "Failed to add item to folder" };
  }
}
