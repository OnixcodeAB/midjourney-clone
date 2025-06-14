"use client";
import { Button } from "@/components/ui/button";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  subscriptionId: string;
  newPlanId: string;
  currentPlanId: string | null;
}

export default function SubscriptionReviseButton({
  subscriptionId,
  newPlanId,
  currentPlanId = null, // Default to null if not provided
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  // If already on target plan, render disabled 'Current Plan' button
  if (currentPlanId === newPlanId) {
    return (
      <Button variant="outline" disabled>
        Current Plan
      </Button>
    );
  }

  // Otherwise, normal update button
  const handleClick = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/subscription/revise-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId, newPlanId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Unknown error");
      }
      toast("Subscription Updated", {
        description: "Your subscription has been successfully updated!",
      });
    } catch (error: any) {
      console.error("Failed to revise subscription:", error);
      toast("Update Failed", {
        description: error.message || "Something went wrong.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={isLoading}>
      Update Subscription
    </Button>
  );
}
