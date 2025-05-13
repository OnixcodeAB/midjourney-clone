"use server";

import { query } from "@/lib/db";

interface User {
  id: string;
  email: string;
  name?: string | null;
}

export default async function registerUser({ id, email, name }: User) {
  //Start transaction
  await query("BEGIN");
  try {
    // Check if the user already exists
    const existingUser = await query(
      `SELECT id, email, name, created_at as "createdAt", updated_at as "updatedAt" 
         FROM users WHERE id = $1 FOR UPDATE`,
      [id]
    );

    // If the user exists - handle update
    if (existingUser?.rowCount && existingUser.rowCount > 0) {
      const currentUser = existingUser.rows[0];

      // Check if update is needed
      if (currentUser.email === email && (!name || currentUser.name === name)) {
        await query("COMMIT");
        console.log("User already registered");
        return { success: true, message: "User already registered" };
      }

      // perform update
      await query(
        `UPDATE users 
           SET email = $2, name = COALESCE($3, name)
           WHERE id = $1
           RETURNING email, name`,
        [id, email, name]
      );

      await query("COMMIT");
      return {
        success: true,
        message: "User updated successfully",
      };
    }
    // If the user does not exist - handle insert
    await query(
      `INSERT INTO users (id, email, name) 
         VALUES ($1, $2, COALESCE($3, $4)) 
         RETURNING id, email, name`,
      [id, email, name || null, name || null]
    );

    await query("COMMIT");
    console.log("User registered successfully");
    return { success: true, message: "User registered successfully" };
  } catch (error) {
    console.log("Error registering user:", error);
    return { success: false, message: "Error registering user" };
  }
}
