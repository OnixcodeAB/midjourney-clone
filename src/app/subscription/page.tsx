import { SubscriptionPlans } from "@/components/Subscription/SubscriptionPlans";
import { query } from "@/lib/db";

interface Plan {
  id: string;
  name: string;
  frequency: string;
  price: number;
  features: string[];
}

export default async function SubscriptionPage() {
  const { rows } = await query(`SELECT * FROM plans ORDER BY id ASC`);

  const Plans: Plan[] = rows;
  console.log(Plans);
  return <SubscriptionPlans plans={Plans} />; // Pass the fetched
}
