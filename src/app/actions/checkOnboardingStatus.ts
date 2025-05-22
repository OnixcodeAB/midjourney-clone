"use server";
import { query } from "@/lib/db";
import { cacheResult, getCached } from "@/lib/redis";

interface User {
  id: string;
  email: string;
  onboarded: boolean;
  subscription_id: string;
  subscription_status: string;
  paypal_plan_id: string;
  created_at: string;
  updated_at: string;
}

export async function checkOnboardingStatus(userId: string) {
  const cacheKey = `onboarding_status_${userId}`;
  const cacheTTL = 86400; // 24 hour

  try {
    // Try to get the cached value
    const cachedStatus = await getCached<boolean>(cacheKey);
    if (cachedStatus !== null) {
      return cachedStatus;
    }

    // If not in cache, query the database
    const { rows } = await query(`SELECT * FROM users WHERE id = $1`, [userId]);
    const onboardedUser = rows[0] as User | null;

    let isOnboarded = false;

    if (onboardedUser) {
      isOnboarded = onboardedUser.onboarded;
    }

    // Cache the result
    await cacheResult(cacheKey, cacheTTL, isOnboarded);

    return isOnboarded; // User not found, return false
  } catch (error) {
    // Handle error
    console.log("Error checking onboarding status:", error);
    return false; // Return false in case of error
  }
}
