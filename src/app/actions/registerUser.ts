"use server";

import { query } from "@/lib/db";

interface User {
  id: string;
  email: string;
}

export default async function registerUser(id: string, email: string) {
  try {
    const existingUser = await query(`SELECT * FROM users WHERE id = $1`, [id]);

    // If the user exists, update the user information
    if (existingUser?.rowCount && existingUser.rowCount > 0) {
      await query(`UPDATE users SET email = $2 WHERE id = $1`, [id, email]);
      console.log("User updated successfully");
      return { success: true, message: "User updated successfully" };
    }

    // If the user does not exist, insert a new user
    await query(`INSERT INTO users (id, email) VALUES ($1, $2)`, [id, email]);
    console.log("User registered successfully");
    return { success: true, message: "User registered successfully" };
  } catch (error) {
    console.log("Error registering user:", error);
    return { success: false, message: "Error registering user" };
  }
}
