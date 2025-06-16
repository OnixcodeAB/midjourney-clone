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
      <Button variant="outline" disabled>
        Current Plan
      </Button>
    );
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={"default"} className="cursor-pointer">
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
