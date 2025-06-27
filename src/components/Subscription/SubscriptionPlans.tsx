"use client";

import React, { useState, useEffect } from "react";
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
import { useUser } from "@clerk/nextjs";
import PayPalButton from "./PayPalButton";

interface Plan {
  id: string;
  plan_id: string;
  name: string;
  frequency: string;
  price: number;
  features: string[];
}

interface SubscriptionPlansProps {
  plans: Plan[];
}

interface UserSubscription {
  plan_id: string;
  subscription_id: string;
  subscription_plan: string;
  subscription_status: string;
}

export const SubscriptionPlans = ({ plans }: SubscriptionPlansProps) => {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const [currentPlan, setCurrentPlan] = useState<Plan>();
  const [userSubscription, setUserSubscription] =
    useState<UserSubscription | null>(null);

  // Get the current user from Clerk
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      const subscriptionData = user.publicMetadata
        .subscription as UserSubscription;
      setUserSubscription(subscriptionData);

      if (subscriptionData) {
        const CurrentPlan = plans.find(
          (plan) => plan.plan_id === subscriptionData.plan_id
        );
        setCurrentPlan(CurrentPlan);
      }
    }
  }, [user, plans]);

  // Filter plans based on the current billing state
  const filteredPlans = plans.filter((plan) => plan.frequency === billing);

  // Sort filterPlans to always show Free, Basic, Pro
  const sortedPlans = filteredPlans.sort((a, b) => {
    const order = ["Free", "Basic", "Pro"];

    if (billing === "monthly") {
      const indexA = order.indexOf(a.name);
      const indexB = order.indexOf(b.name);
      return indexA - indexB;
    }
    return 0;
  });

  return (
    <div className="space-y-8 mt-8 px-2 sm:px-4 md:px-6 z-0">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">
          Purchase a subscription
        </h1>
        <p className="text-gray-600 text-base">
          Choose the plan that works for you
        </p>
      </div>

      {/* Toggle Billing */}
      <div className="flex flex-col items-center  gap-4 ">
        <ToggleGroup
          type="single"
          value={billing}
          onValueChange={(value) => {
            if (value === "monthly" || value === "yearly") {
              setBilling(value);
            }
          }}
          className="inline-flex rounded-full bg-[#e3e4e8] cursor-pointer"
        >
          <ToggleGroupItem
            value="yearly"
            className={`px-5 md:px-8 py-2 text-md font-medium rounded-full cursor-pointer transition-all ${
              billing === "yearly"
                ? "bg-[#303030]! text-white! "
                : "text-gray-900 rounded-none"
            }`}
          >
            Yearly Billing
          </ToggleGroupItem>
          <ToggleGroupItem
            value="monthly"
            className={`px-5 md:px-8 py-2 text-md font-medium rounded-full cursor-pointer ${
              billing === "monthly"
                ? "bg-[#303030]! text-white! "
                : "bg-[#e3e4e8] text-gray-900 rounded-none"
            }`}
          >
            Monthly Billing
          </ToggleGroupItem>
        </ToggleGroup>
        <p className="text-sm">Switch to Yearly to save 20%.</p>
      </div>

      {/* Plans */}
      <div
        className="
          flex flex-col gap-6 items-center md:gap-8 md:justify-center
          lg:flex-row lg:items-start lg:gap-24
          overflow-x-auto
          md:overflow-visible
          pb-4
          "
      >
        {sortedPlans.map((plan) => {
          const isSelected = currentPlan?.id === plan.id;
          return (
            <Card
              key={plan.id}
              className={`border w-[90vw] max-w-xs md:max-w-[400px] flex-shrink-0
                ${isSelected ? "border-[#f25b44]" : "border-gray-200"}
              `}
            >
              <CardHeader>
                <CardTitle className="py-2 text-lg md:text-xl">
                  {plan.name} Plan
                </CardTitle>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl md:text-4xl font-bold">
                    ${plan.price}
                  </span>
                  <span className="text-base md:text-xl text-gray-500 font-semibold">
                    / {plan.frequency}
                  </span>
                </div>
                {plan.frequency === "yearly" && (
                  <Badge
                    variant="outline"
                    className="mt-4 text-xs md:text-sm bg-green-200"
                  >
                    20% off billed annually
                  </Badge>
                )}
                {plan.frequency === "monthly" && (
                  <Badge
                    variant="outline"
                    className="mt-4 text-sm border-none text-black/60"
                  >
                    Billed Monthly
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="flex flex-col justify-center space-y-2">
                <PayPalButton
                  isSubscription={
                    userSubscription?.subscription_status ? true : false
                  }
                  currentPlanId={currentPlan?.plan_id || ""}
                  currentSubsCriptionId={
                    userSubscription?.subscription_id || ""
                  }
                  newPlanId={plan.plan_id || ""}
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
