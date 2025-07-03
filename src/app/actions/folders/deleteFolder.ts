import React from 'react'

export default function deleteFolder() {
  return 
}
import { query } from "@/lib/db";

export async function deleteFolder(id: string): Promise<void> {
  try {
    await query(`DELETE FROM "Folders" WHERE id = $1`, [id]);
  } catch (error) {
    console.error("Error deleting folder from database:", error);
    throw new Error("Failed to delete folder");
  }
}
