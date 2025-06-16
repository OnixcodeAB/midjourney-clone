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
  isSelect: boolean;
  currentSubsCriptionId?: string;
  newPlanId: string;
  planId?: string;
}

export function PayPalButton({
  isSelect,
  currentSubsCriptionId,
  newPlanId,
  planId,
}: PayPalButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={"default"}>Subscribe</Button>
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

        {isSelect && currentSubsCriptionId ? (
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
