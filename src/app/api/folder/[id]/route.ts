import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";
import { cacheResult, getCached, invalidateCache } from "@/lib/redis";
import { getAuth } from "@clerk/nextjs/server";

// GET a specific folder by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = getAuth(req);
  const folderId = params.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 400 });
  }

  try {
    const cacheKey = `folder_${folderId}`;
    const cacheTTL = 3600; // 1 hour

    // Try to get the cached folder
    const cachedFolder = await getCached<FolderType>(cacheKey);
    if (cachedFolder !== null) {
      return NextResponse.json(cachedFolder);
    }

    // If not in cache, query the database
    const { rows } = await query(
      `SELECT * FROM folders WHERE id = $1 AND user_id = $2`,
      [folderId, userId]
    );

    const folder: FolderType | null = rows[0] || null;

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Cache the result
    await cacheResult(cacheKey, cacheTTL, folder);

    return NextResponse.json(folder);
  } catch (error) {
    console.error("Error fetching folder:", error);
    return NextResponse.json(
      { error: "Failed to fetch folder" },
      { status: 500 }
    );
  }
}
// POST update a folder by ID
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = getAuth(req);
  const folderId = params.id;

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

    // Update the folder in the database
    await query(
      `UPDATE folders SET name = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3`,
      [name, folderId, userId]
    );

    // Invalidate cache for this folder
    await invalidateCache(`folder_${folderId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating folder:", error);
    return NextResponse.json(
      { error: "Failed to update folder" },
      { status: 500 }
    );
  }
}
// DELETE a folder by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = getAuth(req);
  const folderId = params.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 400 });
  }

  try {
    // Delete the folder from the database
    await query(`DELETE FROM folders WHERE id = $1 AND user_id = $2`, [
      folderId,
      userId,
    ]);

    // Invalidate cache for this folder
    await invalidateCache(`folder_${folderId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    );
  }
}
