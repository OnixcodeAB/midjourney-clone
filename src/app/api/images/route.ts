// src/app/api/images/route.ts
import { NextResponse } from "next/server";
import dbPromise from "@/lib/db";

export async function GET() {
  try {
    const db = await dbPromise;

    const images = await db.all(`
      SELECT 
        id, 
        url AS src, 
        prompt AS description,
        provider AS author 
      FROM Image 
      ORDER BY rowid DESC
    `);

    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Failed to load images" },
      { status: 500 }
    );
  }
}
