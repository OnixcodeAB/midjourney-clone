import { SubscriptionPlans } from "@/components/Subscription/SubscriptionPlans";
import { query } from "@/lib/db";

export default async function SubscriptionPage() {
  const { rows } = await query(`SELECT * FROM plans `);

  const Plans: Plan[] = rows;
  //console.log("Fetched Plans:", Plans);
  return <SubscriptionPlans plans={Plans} />;
}
