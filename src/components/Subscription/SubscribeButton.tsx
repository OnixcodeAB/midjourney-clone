"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { PayPalSubscriptionButton } from "./paypal-subscription-dialog";
import SubscriptionReviseButton from "./SubscriptionReviseButton";
import { useUser } from "@clerk/nextjs";

interface subscriberInfo {
  name?: {
    given_name?: string;
    surname?: string;
  };
  email_address?: string;
}

interface Props {
  planId: string;
  subscriber?: subscriberInfo;
  isSelected?: boolean;
  subscriptionId: string | undefined;
  SubscriptionStatus: string | undefined;
}

export const SubscribeButton = ({
  planId,
  subscriber,
  isSelected,
  subscriptionId,
  SubscriptionStatus,
}: Props) => {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    if (isSelected) return;

    setIsLoading(true);
    setError(null);
    toast.dismiss();

    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          subscriber: subscriber ?? {},
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to initiate subscription");
      }

      const data = await res.json();
      // Redirect user to PayPal approval URL
      window.location.href = data.approvalUrl;
    } catch (err: any) {
      console.log("Error subscribing:", err);
      setError(err.message);
      toast.error(error, {
        position: "top-center",
        duration: 5000,
      });
      setIsLoading(false);
    }
  };

  // Fetch current subscription details on mount
  useEffect(() => {
    async function fetchSubscription() {
      try {
        setIsChecking(true);
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
    if (user) fetchSubscription();
  }, [subscriptionId]);

  // If still checking, disable button until we know
  if (isChecking) {
    return (
      <Button variant="outline" disabled>
        Checking...
      </Button>
    );
  }

  if (currentPlanId === planId) {
    return (
      <Button variant="outline" disabled>
        Current Plan
      </Button>
    );
  }

  if (SubscriptionStatus) {
    return (
      <SubscriptionReviseButton
        subscriptionId={subscriptionId || ""}
        newPlanId={planId}
      />
    );
  }

  return <PayPalSubscriptionButton planId={planId} isSelected />;
};
