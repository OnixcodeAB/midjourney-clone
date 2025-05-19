// app/api/create/[id]/route.ts
import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This route fetches a single image by its ID
// and returns the image data in JSON format.
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  try {
    const {
      rows: [image],
    } = await query(
      `SELECT
        id,
        url AS src,
        prompt,
        provider AS author
    FROM "Image"
    WHERE id = $1`,
      [id]
    );

    if (!image) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
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
