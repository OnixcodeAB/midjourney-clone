"use server";

import { query } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export const deleteImageById = async (ImageId: string) => {
  const user = await currentUser();

  if (!user?.id) {
    return { error: "Not authorized" };
  }
  try {
    await query(`DELETE FROM "Image" WHERE id = $1 AND user_id =$2`, [
      ImageId,
      user.id,
    ]);
    return { success: true };
  } catch (error) {
    console.error("Error deleting Image:", error);
    return { error: "Failed to delete Image" };
  }
};
