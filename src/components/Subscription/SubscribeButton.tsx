"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Loader } from "lucide-react";

interface subscriberInfo {
  name?: string;
  email_address?: string;
}

interface SubscribeButtonProps {
  planId: string;
  subscriber?: subscriberInfo;
  isSelected?: boolean;
}

export const SubscribeButton = ({
  planId,
  subscriber,
  isSelected,
}: SubscribeButtonProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          subscriber,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "subscription failed");
      }

      const data = await res.json();
      // Redirect user to PayPal approval URL
      window.location.href = data.approvalUrl;
    } catch (err: any) {
      console.log("Error subscribing:", err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isSelected ? "secondary" : "default"}
      className="w-full flex items-center justify-center cursor-pointer"
      onClick={handleSubscribe}
    >
      {isSelected ? (
        "Selected"
      ) : isLoading ? (
        <Loader className="animate-spin h-5 w-5" />
      ) : (
        "Subscribe"
      )}
    </Button>
  );
};
