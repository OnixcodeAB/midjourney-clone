"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Loader } from "lucide-react";
import { toast } from "sonner";

interface subscriberInfo {
  name?: {
    given_name?: string;
    surname?: string;
  };
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

  return (
    <Button
      variant={isSelected ? "secondary" : "default"}
      className="w-full h-9 flex items-center justify-center cursor-pointer"
      onClick={handleSubscribe}
    >
      {isSelected ? (
        "Selected"
      ) : isLoading ? (
        <Loader className="animate-spin h-7 w-7 size-1" />
      ) : (
        "Subscribe"
      )}
    </Button>
  );
};
