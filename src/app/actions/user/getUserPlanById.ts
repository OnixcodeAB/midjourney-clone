"use server";
import { query } from "@lib/db";
import { currentUser } from "@clerk/nextjs/server";

export const getUserPlanById = async (planId: string) => {
  try {
    const user = await currentUser();
    // Validate user authentication
    if (!user?.id) {
      throw new Error("User not authenticated");
    }
    // Ensure plan_id is provided
    if (!planId) {
      throw new Error("Plan ID is required");
    }
    // Fetch the plan details by plan_id from the database
    const { rows } = await query(`SELECT * FROM "plans" WHERE plan_id = $1`, [
      planId,
    ]);
    console.log("Planid", planId, "rows:", rows);
    return rows[0] as SubscriptionPlan;
  } catch (error) {
    console.error("Error fetching user plan by ID:", error);
    return;
  }
};
