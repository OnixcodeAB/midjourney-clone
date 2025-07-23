"use server";

import { query } from "@/lib/db";

export async function updatePublicImage(userId: string, publicImage: boolean) {
  //console.log(publicImage)
  try {
    // Update the user's public image in the database
    await query(`UPDATE users SET public_image =$1 WHERE id =$2`, [
      publicImage,
      userId,
    ]);
    return { success: true };
  } catch (error) {
    console.error("Error updating public image:", error);
    return { success: false, message: "Failed to update public image." };
  }
}
