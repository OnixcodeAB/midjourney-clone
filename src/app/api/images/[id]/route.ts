// src/app/api/images/[id]/route.ts
import { NextResponse } from "next/server";
import dbPromise from "@/lib/db";

/// This route fetches a single image by its ID
/// and returns the image data in JSON format.
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  try {
    const db = await dbPromise;

    const image = await db.get(
      `SELECT 
        id, 
        url AS src, 
        prompt, 
        provider AS author 
       FROM Image 
       WHERE id = ?`,
      [id]
    );

    if (!image) {
      return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(image);
  } catch (error) {
    console.error("[GET_IMAGE_BY_ID_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}
