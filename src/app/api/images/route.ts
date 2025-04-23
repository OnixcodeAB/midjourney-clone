// src/app/api/images/route.ts
import { NextResponse } from "next/server";
import dbPromise, { query } from "@/lib/db";

export async function GET() {
  try {
    const db = await dbPromise;

    const { rows: images } = await query(`
      SELECT 
        id, 
        url AS src, 
        prompt AS description,
        provider AS author 
      FROM "Image"
      ORDER BY "createdat" DESC
    `);
    console.log(images);
    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Failed to load images" },
      { status: 500 }
    );
  }
}
