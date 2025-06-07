"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  subscriptionId: string;
  newPlanId: string;
}

export default function SubscriptionReviseButton({
  subscriptionId,
  newPlanId,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  // Fetch current subscription details on mount
  useEffect(() => {
    async function fetchSubscription() {
      try {
        const res = await fetch(
          `/api/subscription/get-subscription?subscriptionId=${subscriptionId}`
        );
        const data = await res.json();
        if (res.ok) {
          setCurrentPlanId(data.plan_id);
        } else {
          console.error("Error fetching subscription:", data.error);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsChecking(false);
      }
    }
    fetchSubscription();
  }, [subscriptionId]);

  // If still checking, disable button until we know
  if (isChecking) {
    return (
      <Button variant="outline" disabled>
        Checking...
      </Button>
    );
  }

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
      {isLoading ? "Updating…" : "Update Subscription"}
    </Button>
  );
}
