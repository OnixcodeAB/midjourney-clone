"use server";

import { currentUser } from "@clerk/nextjs/server";
import { query } from "@/lib/db";
import { invalidateCache } from "@/lib/redis";

export async function deleteFolderItem(id: string, FolderId: string) {
  console.log(FolderId, id);
  const user = await currentUser();

  if (!user?.id) {
    return { error: "Not authorized" };
  }

  try {
    // Delete the item from the database
    await query(`DELETE FROM "FolderItem" WHERE id = $1 AND folder_id = $2`, [
      id,
      FolderId,
    ]);

    // Invalidate cache for this folder
    await invalidateCache(`folder_items_${FolderId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting folder:", error);
    return { error: "Failed to delete folder" };
  }
}
