import { SubscriptionPlans } from "@/components/Subscription/SubscriptionPlans";
import { query } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";

interface Plan {
  id: string;
  plan_id: string;
  name: string;
  frequency: string;
  price: number;
  features: string[];
}

export default async function SubscriptionPage() {
  const { rows } = await query(`SELECT * FROM plans `);

  const Plans: Plan[] = rows;
  return <SubscriptionPlans plans={Plans} />; // Pass the fetched
}
