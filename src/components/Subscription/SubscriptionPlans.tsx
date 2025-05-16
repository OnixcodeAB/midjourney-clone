"use client";

import React, { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Check } from "lucide-react";
import { SubscribeButton } from "@/components/Subscription/SubscribeButton";
import { clerkClient } from "@clerk/nextjs/server";
import { useUser } from "@clerk/nextjs";

interface Plan {
  id: string;
  name: string;
  frequency: string;
  price: number;
  features: string[];
}

interface SubscriptionPlansProps {
  plans: Plan[];
}

interface UserSubscription {
  subscription_id: string;
  subscription_plan: string;
  subscription_status: string;
}

export const SubscriptionPlans = ({ plans }: SubscriptionPlansProps) => {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Get the current user from Clerk
  const { user } = useUser();

  // Check if the user has a subscription
  const userSubscription = user?.publicMetadata
    ?.subscription as UserSubscription;

  // If the user has a subscription, set the selected plan to their current plan
  if (userSubscription) {
    const currentPlan = plans.find(
      (plan) => plan.id === userSubscription?.subscription_id
    );
    setSelectedPlan(currentPlan?.id || null);
  }

  // Filter plans based on the current billing state
  const filteredPlans = plans.filter((plan) => plan.frequency === billing);

  return (
    <div className="space-y-8 mt-8 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Purchase a subscription</h1>
        <p className="text-gray-600">Choose the plan that works for you</p>
      </div>

      <div className="flex flex-col justify-center items-center px-8 gap-4">
        <ToggleGroup
          type="single"
          value={billing || "monthly"}
          onValueChange={(value) => setBilling(value as "monthly" | "yearly")}
          className="inline-flex rounded-full bg-[#e3e4e8]"
        >
          <ToggleGroupItem
            value="yearly"
            className={`px-8 py-2 text-md cursor-pointer font-medium rounded-full transition-all ease-in-out ${
              billing === "yearly"
                ? "bg-[#303030]! text-white! "
                : "text-gray-900 rounded-none"
            }`}
          >
            Yearly Billing
          </ToggleGroupItem>
          <ToggleGroupItem
            value="monthly"
            className={`px-8 py-2 text-md cursor-pointer font-medium rounded-full ${
              billing === "monthly"
                ? "bg-[#303030]! text-white! "
                : "bg-[#e3e4e8] text-gray-900 rounded-none"
            }`}
          >
            Monthly Billing
          </ToggleGroupItem>
        </ToggleGroup>
        <p>Switch to Yearly to save 20%.</p>
      </div>

      <div className="px-4 flex gap-24 justify-center ">
        {filteredPlans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <Card
              key={plan.id}
              className={`border w-[400px] ${
                isSelected ? "border-indigo-500" : "border-gray-200"
              }`}
            >
              <CardHeader>
                <CardTitle className="py-2">{plan.name} Plan</CardTitle>
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-xl text-gray-500 font-semibold">
                    / {plan.frequency}
                  </span>
                </div>
                {plan.frequency === "yearly" && (
                  <Badge
                    variant="outline"
                    className="mt-4 text-sm bg-green-200"
                  >
                    20% off billed annually
                  </Badge>
                )}
                {plan.frequency === "monthly" && (
                  <Badge
                    variant="outline"
                    className="mt-4 text-lg border-none text-black/60"
                  >
                    Billed Monthly
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="flex flex-col justify-center space-y-2">
                <SubscribeButton
                  key={plan.id}
                  planId={plan.id}
                  subscriber={{
                    name: {
                      given_name: user?.firstName ?? undefined,
                      surname: user?.lastName ?? undefined,
                    },
                    email_address: user?.emailAddresses[0]?.emailAddress,
                  }}
                  isSelected={isSelected}
                />

                {billing === "monthly" && (
                  <Button
                    className="cursor-pointer"
                    variant="link"
                    onClick={() => {
                      setBilling("yearly");
                    }}
                  >
                    <span className="text-[15px] text-gray-500 flex items-center gap-1">
                      Save with annual billing (20% off)
                      <ArrowUpRight />
                    </span>
                  </Button>
                )}
                {billing === "yearly" && (
                  <Button
                    className="cursor-pointer"
                    variant="link"
                    onClick={() => {
                      setBilling("monthly");
                    }}
                  >
                    <span className="text-[15px] text-gray-500 flex items-center gap-1">
                      View monthly billing
                      <ArrowUpRight />
                    </span>
                  </Button>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-2 items-start">
                {plan.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-2">
                    <Check className="size-[16px] text-[#f25b44]" />
                    <span className="text-sm text-gray-700">{feat}</span>
                  </div>
                ))}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
