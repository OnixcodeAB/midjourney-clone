import { query } from "@/lib/db";

interface User {
  id: string;
  email: string;
  onboarding_status: boolean;
  subscription_id: string;
  subscription_status: string;
  paypal_plan_id: string;
  created_at: string;
  updated_at: string;
}

export async function checkOnboardingStatus(userId: string, url: string) {
  try {
    const { rows } = await query(`SELECT * FROM users WHERE id = $1`, [userId]);
    const onboardedUser = rows[0] as User | null;
    if (onboardedUser) {
      return onboardedUser.onboarding_status;
    }
    return false; // User not found, return false
  } catch (error) {
    // Handle error
    console.log("Error checking onboarding status:", error);
    return false; // Return false in case of error
  }
}
