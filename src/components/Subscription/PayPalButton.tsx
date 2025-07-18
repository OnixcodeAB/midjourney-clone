import { useState, useEffect, useRef } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PayPalSubscribeButton } from "./PayPalSubscribeButton";
import { PayPalSubscriptionUpdateButton } from "./PayPalSubscriptionUpdatedButton";

interface PayPalButtonProps {
  isSubscription?: boolean;
  currentSubsCriptionId?: string;
  newPlanId: string;
  currentPlanId?: string;
  planId?: string;
}

export default function PayPalButton({
  isSubscription = false,
  currentSubsCriptionId,
  currentPlanId,
  newPlanId,
}: PayPalButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (currentPlanId === newPlanId) {
    return (
      <Button variant="default" className="h-11 dark:bg-gray-600 " disabled>
        <span className="dark:text-white">Current Plan</span>
      </Button>
    );
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant={"default"}
          className="cursor-pointer h-11 dark:bg-[#2e3038] dark:text-white"
        >
          {isSubscription ? "Upgrade subscription" : "Subscribe"}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="p-4 w-fit">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Choose a subscription payment method
          </AlertDialogTitle>
          <AlertDialogDescription className="p-2">
            Please use one button below to complete your subscription process.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <>
          {isSubscription && (
            <PayPalSubscriptionUpdateButton
              currentSubscriptionId={currentSubsCriptionId || ""}
              newPlanId={newPlanId}
              onOpenChange={setIsOpen}
            />
          )}
          {!isSubscription && <PayPalSubscribeButton planId={newPlanId} />}
        </>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
