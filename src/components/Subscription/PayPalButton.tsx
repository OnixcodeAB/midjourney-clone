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
import { PayPalSubscriptionUpdatedButton } from "./PayPalSubscriptionUpdatedButton";

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
  planId,
}: PayPalButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (currentPlanId === newPlanId) {
    return (
      <Button variant="outline" disabled>
        Current Plan
      </Button>
    );
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={"default"}>
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

        {currentSubsCriptionId ? (
          <PayPalSubscriptionUpdatedButton
            currentSubsCriptionId={currentSubsCriptionId}
            newPlanId={newPlanId}
          />
        ) : (
          planId && <PayPalSubscribeButton planId={planId} />
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
