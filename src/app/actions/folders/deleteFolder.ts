"use server";
import { query } from "@/lib/db";
import { invalidateCache } from "@/lib/redis";
import { currentUser } from "@clerk/nextjs/server";

export async function deleteFolder(id: string): Promise<void> {
  try {
    // Get the current user
    const user = await currentUser();

    // Ensure user is authenticated
    if (!user?.id) throw new Error("Not authenticated");
    
    // Delete the folder from the database
    await query(`DELETE FROM "Folders" WHERE id = $1`, [id]);

    // Invalidate the cache for the user's folders
    const cacheKey = `folders_${user.id}`;
    await invalidateCache(cacheKey);
  } catch (error) {
    console.error("Error deleting folder from database:", error);
    throw new Error("Failed to delete folder");
  }
}
