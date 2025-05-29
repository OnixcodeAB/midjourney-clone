"use server";

import { currentUser } from "@clerk/nextjs/server";
import { query } from "@/lib/db";
import { invalidateCache } from "@/lib/redis";

// Returns new folder object { id, name, created_at }
export async function addFolder(name: string) {
  const user = await currentUser();
  if (!user?.id) throw new Error("Not authenticated");

  const { rows } = await query(
    `INSERT INTO "Folders" (user_id, name) VALUES ($1, $2) RETURNING *`,
    [user.id, name]
  );
  // Invalidate cache
  const cacheKey = `folders_${user.id}`;
  await invalidateCache(cacheKey);

  return rows[0];
}
