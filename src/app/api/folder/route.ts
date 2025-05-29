import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";
import { cacheResult, getCached, invalidateCache } from "@/lib/redis";
import { getAuth } from "@clerk/nextjs/server";

// GET all folders for user
export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 400 });
  }

  try {
    const cacheKey = `folders_${userId}`;
    const cacheTTL = 3600; // 1 hour

    // Try to get the cached folders
    const cachedFolders = await getCached<FolderType[]>(cacheKey);
    if (cachedFolders !== null) {
      return NextResponse.json(cachedFolders);
    }

    // If not in cache, query the database
    const { rows } = await query(
      `SELECT * FROM folders WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    const folders: FolderType[] = rows;

    // Cache the result
    await cacheResult(cacheKey, cacheTTL, folders);

    return NextResponse.json(folders);
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}

// POST create a new folder
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 400 });
  }
  try {
    const { name } = await req.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Invalid folder name" },
        { status: 400 }
      );
    }

    const { rows } = await query(
      `INSERT INTO folders (user_id, name) VALUES ($1, $2) RETURNING *`,
      [userId, name]
    );

    const newFolder: FolderType = rows[0];

    // Invalidate cache
    const cacheKey = `folders_${userId}`;
    await invalidateCache(cacheKey);

    return NextResponse.json(newFolder, { status: 201 });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
}
