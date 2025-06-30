"use server";

import { query } from "@/lib/db";

export async function getPublicImage(userId: string): Promise<boolean> {
  try {
    const { rows } = await query(
      `SELECT public_image FROM users WHERE id = $1`,
      [userId]
    );
    return rows[0]?.public_image ?? false; // Default to true if not set
  } catch (error) {
    console.error("Error fetching public_image:", error);
    return false;
  }
}
