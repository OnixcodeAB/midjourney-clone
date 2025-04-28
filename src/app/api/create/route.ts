// app/api/create/route.ts
import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { rows: images } = await query(`
         SELECT 
           id, 
           url,
           prompt,
           provider,
           status,
            progress_pct,
            createdat
         FROM "Image"
         ORDER BY "createdat" DESC
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
