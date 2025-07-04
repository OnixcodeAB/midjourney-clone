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
import { ArrowUpRight, Check, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import PayPalButton from "./PayPalButton";

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

  const filteredPlans = plans.filter((plan) => plan.frequency === billing);

  const sortedPlans = filteredPlans.sort((a, b) => {
    const order = ["Free", "Basic", "Pro"];
    const indexA = order.indexOf(a.name);
    const indexB = order.indexOf(b.name);
    return indexA - indexB;
  });

  const renderFeature = (feature: Feature) => {
    if (feature.enabled === false) return null;

    return (
      <div key={feature.name} className="flex flex-col gap-1 mb-2">
        <div className="flex items-center gap-2">
          <Check className="size-[16px] text-[#f25b44]" />

          <span className="text-sm font-medium text-gray-700 dark:text-white">
            {feature.name}
          </span>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
          {feature.description}
        </p>

        {feature.quantity && (
          <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
            <strong>Limit:</strong> {feature.quantity}
            {feature.details?.period && ` per ${feature.details.period}`}
            {feature.duration && ` (${feature.duration})`}
          </p>
        )}

        {feature.details && (
          <div className="ml-6 mt-1 space-y-1">
            {Object.entries(feature.details)
              .sort(([a], [b]) => {
                const order = ["high_quality", "medium_quality", "low_quality"];
                return order.indexOf(a) - order.indexOf(b);
              })
              .map(([key, detail]) => (
                <div
                  key={key}
                  className="text-xs text-gray-500 dark:text-gray-400"
                >
                  <strong>
                    {key
                      .split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                    :
                  </strong>{" "}
                  {detail.quantity} {detail.period && `per ${detail.period}`}
                </div>
              ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 mt-8 px-2 sm:px-4 md:px-6 z-0">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">
          Purchase a subscription
        </h1>
        <p className="text-gray-600 text-xl">
          Choose the plan that works for you
        </p>
      </div>

      {/* Toggle Billing */}
      <div className="flex flex-col items-center gap-4">
        <ToggleGroup
          type="single"
          value={billing}
          onValueChange={(value) => {
            if (value === "monthly" || value === "yearly") {
              setBilling(value);
            }
          }}
          className="inline-flex rounded-full p-1 bg-[#e3e4e8] dark:bg-[#2e3038] border-none cursor-pointer"
        >
          <ToggleGroupItem
            value="yearly"
            className={`px-5 md:px-8 py-2 text-md font-medium rounded-full! cursor-pointer ${
              billing === "yearly"
                ? "bg-[#2e3038] text-white dark:bg-[#e2e4e9] dark:text-gray-900"
                : "bg-[#e3e4e8] dark:bg-[#2e3038] dark:text-white text-gray-900 rounded-none"
            }`}
          >
            Yearly Billing
          </ToggleGroupItem>
          <ToggleGroupItem
            value="monthly"
            className={`px-5 md:px-8 py-2 text-md font-medium rounded-full cursor-pointer ${
              billing === "monthly"
                ? "bg-[#2e3038] dark:bg-[#e2e4e9] dark:text-gray-900 text-white"
                : "bg-[#e3e4e8] dark:bg-[#2e3038] dark:text-white text-gray-900 rounded-none"
            }`}
          >
            Monthly Billing
          </ToggleGroupItem>
        </ToggleGroup>
        {billing === "monthly" && (
          <p className="text-sm">Switch to Yearly to save 20%.</p>
        )}
      </div>

      {/* Plans */}
      <div className="flex flex-col gap-4 items-center md:gap-8 md:justify-center lg:flex-row lg:items-start lg:gap-24 overflow-x-auto md:overflow-visible pb-4">
        {sortedPlans.map((plan) => {
          const isSelected = currentPlan?.id === plan.id;
          return (
            <Card
              key={plan.id}
              className={`border dark:bg-black/30 w-[90vw] max-w-xs md:max-w-[400px] flex-shrink-0 ${
                isSelected
                  ? "border-[#f25b44]"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <CardHeader>
                <CardTitle className="py-2 text-lg md:text-xl">
                  {plan.name} Plan
                </CardTitle>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl md:text-4xl font-bold">
                    {plan.frequency == "monthly" && `$${plan.price}`}
                    {plan.frequency === "yearly" && (
                      <>
                        <span className="line-through text-gray-500">
                          ${Math.round(plan.price / 0.8)}
                        </span>{" "}
                        ${plan.price}
                      </>
                    )}
                  </span>
                  <span className="text-base md:text-xl text-gray-500 font-semibold">
                    / {plan.frequency}
                  </span>
                </div>
                {plan.frequency === "yearly" && (
                  <Badge
                    variant="outline"
                    className="mt-4 text-xs md:text-sm dark:text-white/60 bg-gray-200 dark:bg-gray-800"
                  >
                    20% off billed annually
                  </Badge>
                )}
                {plan.frequency === "monthly" && (
                  <Badge
                    variant="outline"
                    className="mt-4 text-sm border-none text-black/60 dark:text-white/60 bg-gray-200 dark:bg-gray-800"
                  >
                    Billed Monthly
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="flex flex-col justify-center space-y-1">
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
                    <span className="text-[15px] text-gray-500 dark:text-white/60 flex items-center gap-1">
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
                    <span className="text-[15px] text-gray-500 dark:text-white/60 flex items-center gap-1">
                      View monthly billing
                      <ArrowUpRight />
                    </span>
                  </Button>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-2 items-start">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {plan.description}
                </p>
                {plan.features.features.map((feature) =>
                  renderFeature(feature)
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
