"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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

interface Plan {
  key: string;
  name: string;
  monthly: number;
  yearly: number;
  features: string[];
}

const PLANS: Plan[] = [
  {
    key: "basic",
    name: "Basic",
    monthly: 10,
    yearly: 8,
    features: [
      "Limited generations (~200 / month)",

      "Optional credit top ups",
      "3 concurrent fast jobs",
      "Use Editor on uploaded images",
    ],
  },
  {
    key: "standard",
    name: "Standard",
    monthly: 30,
    yearly: 24,
    features: [
      "15h Fast generations",
      "Optional credit top ups",
      "3 concurrent fast jobs",
      "Unlimited Relaxed generations",
      "Use Editor on uploaded images",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    monthly: 60,
    yearly: 48,
    features: [
      "30h Fast generations",
      "General commercial terms",
      "Optional credit top ups",
      "12 concurrent fast jobs",
      "Unlimited Relaxed generations",
      "Use Editor on uploaded images",
    ],
  },
];

export default function OnboardingPlans() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const router = useRouter();

  const handleSubscribe = (planKey: string) => {
    // navigate to subscription flow
    router.push(`/onboarding/subscribe?plan=${planKey}&billing=${billing}`);
  };

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
          className="inline-flex rounded-full  bg-[#e3e4e8]"
        >
          <ToggleGroupItem
            value="yearly"
            className={`px-8 py-2 text-md cursor-pointer  font-medium rounded-full transition-all ease-in-out ${
              billing === "yearly"
                ? "bg-[#303030]! text-white! "
                : " text-gray-900 rounded-none"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const price = billing === "monthly" ? plan.monthly : plan.yearly;
          const isSelected = selectedPlan === plan.key;
          return (
            <Card
              key={plan.key}
              className={`border max-w-md  ${
                isSelected ? "border-indigo-500" : "border-gray-200"
              } `}
            >
              <CardHeader>
                <CardTitle className="py-2">{plan.name} Plan</CardTitle>
                <div className="flex items-baseline space-x-1">
                  {billing === "yearly" && (
                    <span className="text-4xl text-gray-500 line-through mr-3">
                      ${plan.monthly}
                    </span>
                  )}
                  <span className="text-4xl font-bold">${price}</span>
                  <span className="text-xl text-gray-500 font-semibold">
                    / {billing}
                  </span>
                </div>
                {billing === "yearly" && (
                  <Badge
                    variant="outline"
                    className="mt-4 text-sm bg-green-200"
                  >
                    20% off billed annually
                  </Badge>
                )}
                {billing === "monthly" && (
                  <Badge
                    variant="outline"
                    className="mt-4 text-lg border-none text-black/60 "
                  >
                    Billed Monthly
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="flex flex-col justify-center space-y-2 ">
                <SubscribeButton
                  key={plan.key}
                  planId="P-XXXXXXXXXXXXX"
                  subscriber={{
                    name: "John Doe",
                    email_address: "john@example.com",
                  }}
                  isSelected={isSelected}
                />

                {billing == "monthly" && (
                  <Button
                    className="cursor-pointer"
                    variant="link"
                    onClick={() => {
                      setBilling("yearly");
                    }}
                  >
                    <span className="text-[15px] text-gray-500  flex items-center gap-1">
                      Save with annual billing (20% off)
                      <ArrowUpRight />
                    </span>
                  </Button>
                )}
                {billing == "yearly" && (
                  <Button
                    className="cursor-pointer"
                    variant="link"
                    onClick={() => {
                      setBilling("monthly");
                    }}
                  >
                    <span className="text-[15px] text-gray-500    flex items-center gap-1">
                      View monthly billing
                      <ArrowUpRight />
                    </span>
                  </Button>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-2 items-start ">
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
}
