import { SubscriptionPlans } from "@/components/Subscription/SubscriptionPlans";
import { query } from "@/lib/db";

export default async function SurveysPage() {
  //console.log("Fetched Plans:", Plans);
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
        {/* parent */}
      <div className="w-full animate-rotate-border max-w-sm rounded-lg card-wrapper">
        {/* content */}
        <div className="p-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-center">
          <h2 className="text-2xl font-bold ">Surveys Coming Soon!</h2>
        </div>
      </div>
    </div>
  );
}
