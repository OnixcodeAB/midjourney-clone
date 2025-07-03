import { SubscriptionPlans } from "@/components/Subscription/SubscriptionPlans";
import { query } from "@/lib/db";

interface Plan {
  id: string;
  plan_id: string;
  name: string;
  frequency: string;
  price: number;
  features: DbFeaturesContainer;
  description: string;
}

export default async function SubscriptionPage() {
  const { rows } = await query(`SELECT * FROM plans `);

  const Plans: Plan[] = rows;
  //console.log("Fetched Plans:", Plans);
  return <SubscriptionPlans plans={Plans} />;
}
