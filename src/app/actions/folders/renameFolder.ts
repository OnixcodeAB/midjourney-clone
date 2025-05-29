"use server";

import { currentUser } from "@clerk/nextjs/server";
import { query } from "@/lib/db";
import { invalidateCache } from "@/lib/redis";

// Returns updated folder object { id, name, created_at }
export async function renameFolder(id: string, newName: string) {
  const user = await currentUser();
  if (!user?.id) throw new Error("Not authenticated");

  const { rows } = await query(
    `UPDATE "Folders" SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING id, name, created_at`,
    [newName, id, user.id]
  );
  if (!rows.length) throw new Error("Folder not found or unauthorized");

  // Invalidate cache for folders
  const cacheKey = `folders_${user.id}`;
  await invalidateCache(cacheKey);

  return rows[0];
}
