import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";
import { cacheResult, getCached, invalidateCache } from "@/lib/redis";
import { getAuth } from "@clerk/nextjs/server";


// GET items in folder
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
    const cacheKey = `folder_items_${folderId}`;
    const cacheTTL = 3600; // 1 hour

    // Try to get the cached items
    const cachedItems = await getCached<FolderItem[]>(cacheKey);
    if (cachedItems !== null) {
      return NextResponse.json(cachedItems);
    }

    // If not in cache, query the database
    const { rows } = await query(
      `SELECT fi.id, fi.image_id, fi.image_title fi.url, fi.type
     FROM "FolderItem" fi
     JOIN "Folders" f ON fi.folder_id = f.id
     WHERE fi.folder_id = $1 AND f.user_id = $2`,
      [folderId, userId]
    );

    const items: FolderItem[] = rows;

    // Cache the result
    await cacheResult(cacheKey, cacheTTL, items);

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching folder items:", error);
    return NextResponse.json(
      { error: "Failed to fetch folder items" },
      { status: 500 }
    );
  }
}

// POST add item to folder
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
    const { image_id, image_title, url, type } = await req.json();

    if (!image_id || !image_title || !url || !type) {
      return NextResponse.json({ error: "Invalid item data" }, { status: 400 });
    }

    const { rows } = await query(
      `INSERT INTO "FolderItem" (image_id, image_title, url, type, folder_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [image_id, image_title, url, type, folderId]
    );

    const newItem: FolderItem = rows[0];

    if (!newItem) {
      return NextResponse.json(
        { error: "Failed to add item" },
        { status: 500 }
      );
    }

    // Invalidate cache for the folder items
    await invalidateCache(`folder_items_${folderId}`);

    return NextResponse.json(newItem);
  } catch (error) {
    console.error("Error adding item to folder:", error);
    return NextResponse.json(
      { error: "Failed to add item to folder" },
      { status: 500 }
    );
  }
}

// DELETE an item from a folder
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = getAuth(req);
  const itemId = params.id;

  if (!userId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 400 });
  }

  try {
    // Delete the item from the database
    await query(`DELETE FROM "FolderItem" WHERE id = $1`, [itemId]);

    // Invalidate cache for the folder items
    await invalidateCache(`folder_items_${itemId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting item from folder:", error);
    return NextResponse.json(
      { error: "Failed to delete item from folder" },
      { status: 500 }
    );
  }
}
