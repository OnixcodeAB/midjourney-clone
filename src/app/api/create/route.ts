// app/api/create/route.ts
import dbPromise from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = await dbPromise;

    const images = await db.all(`
      SELECT 
        id, 
        url , 
        prompt ,
        status,
        progress_pct,
        createdAt 
      FROM Image 
      ORDER BY rowid DESC
    `);

    return NextResponse.json(images);
  } catch (error) {
    console.error("[API_CREATE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to load images" },
      { status: 500 }
    );
  }
}
