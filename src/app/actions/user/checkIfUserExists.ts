"use server"
import { query } from "@/lib/db";

export async function checkIfUserExists(userId: string) {
  try {
    // Query the database to get user details by userId
    const { rows } = await query(`SELECT * FROM users WHERE id = $1`, [userId]);

    // Get the first user from the result
    const existingUser = rows[0];

    // Initialize authentication status
    let isUserAuthenticated = existingUser ? true : false;

    // Return the authentication status
    return isUserAuthenticated;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw new Error("Failed to fetch user data.");
  }
}
