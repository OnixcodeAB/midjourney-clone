"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
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

      // Handle non-JSON responses
      if (!res.headers.get("content-type")?.includes("application/json")) {
        throw new Error(`Unexpected response: ${await res.text()}`);
      }

      const json = await res.json();

      if (!res.ok) {
        // Handle PayPal API errors
        throw new Error(
          json.error?.message ||
            json.error?.error_description ||
            JSON.stringify(json.error) ||
            `Request failed with status ${res.status}`
        );
      }

      // Handle success case
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
