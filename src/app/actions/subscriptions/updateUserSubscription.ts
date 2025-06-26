"use server";

import { cancelPayPalSubscription } from "@/components/Subscription/CancelSubscription";
import { query } from "@/lib/db"; // Assuming you have a query utility
import { auth } from "@clerk/nextjs/server";

interface Props {
  plan_id: string;
  subscriptionId: string;
  status: string;
  OldSubscriptionId?: string; // Optional: for updating existing subscriptions
}

export async function updateUserSubscription({
  plan_id,
  subscriptionId,
  status = "active",
  OldSubscriptionId, // Optional: for updating existing subscriptions
}: Props) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "user not authorized",
      };
    }

    // Fetch the plan details
    const { rows } = await query(`SELECT * FROM plans WHERE plan_id = $1`, [
      plan_id,
    ]);
    const plan = rows[0];

    if (!plan) {
      throw new Error("Plan not found");
    }

    // Execute database and Clerk updates in parallel
    const [dbUpdate, clerkUpdate] = await Promise.allSettled([
      // Update database
      query(
        `UPDATE users 
         SET subscription_id = $1, subscription_status = $3, paypal_plan_id = $4, plan_id = $5, onboarded = true
         WHERE id = $2`,
        [subscriptionId, userId, status, plan_id, plan.id]
      ),

      // Update Clerk metadata
      fetch(`https://api.clerk.dev/v1/users/${userId}/metadata`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_metadata: {
            subscription: {
              plan_id: plan_id,
              subscription_plan: plan.name || "free",
              subscription_id: subscriptionId || "",
              subscription_status: status || "active",
              subscription_frequency: plan.frequency || "monthly",
            },
          },
        }),
      }),
    ]);

    // Handle potential errors from parallel operations
    const errors: string[] = [];

    if (dbUpdate.status === "rejected") {
      const error = `Database update failed: ${dbUpdate.reason}`;
      console.error(error);
      errors.push(error);
    }

    if (clerkUpdate.status === "rejected") {
      const error = `Clerk metadata update failed: ${clerkUpdate.reason}`;
      console.error(error);
      errors.push(error);
    } else if (clerkUpdate.value && !clerkUpdate.value.ok) {
      const clerkResponse = await clerkUpdate.value.json();
      const error = `Clerk API error: ${JSON.stringify(clerkResponse)}`;
      console.error(error);
      errors.push(error);
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: errors.join(" | "),
      };
    }

    // If OldSubscriptionId is provided, cancel the previous subscription
    if (OldSubscriptionId) {
      await cancelPayPalSubscription(
        OldSubscriptionId,
        "User updated subscription"
      );
    }

    return {
      success: true,
      message: "Subscription updated successfully",
    };
  } catch (error) {
    console.error("Subscription update error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    };
  }
}
