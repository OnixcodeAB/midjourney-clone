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
import { updateUserSubscription } from "@/app/actions/subscriptions/updateUserSubscription";
import { toast } from "sonner";
import SubscriptionReviseButton from "./SubscriptionReviseButton";

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: {
        style: {
          shape: string;
          color: string;
          layout: string;
          label: string;
        };
        createSubscription: (data: any, actions: any) => Promise<any>;
        onApprove: (data: any) => Promise<void>;
        onError: (err: Error) => void;
      }) => {
        render: (container: HTMLElement) => void;
      };
    };
  }
}

interface PayPalSubscriptionDialogProps {
  planId: string;
  isSelected: boolean;
  SubscriptionId?: string; // Needed for revise/upgrade/downgrade
}

export function PayPalSubscriptionButton({
  planId,
  isSelected,
  SubscriptionId,
}: PayPalSubscriptionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const buttonRendered = useRef(false);

  // Load PayPal script when dialog opens
  useEffect(() => {
    if (!isOpen || scriptLoaded) return;

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
    script.dataset.sdkIntegrationSource = "button-factory";
    script.async = true;

    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      console.error("PayPal SDK failed to load");
      toast.error("Payment Error", {
        description: "Failed to load PayPal payment processor",
      });
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      setScriptLoaded(false);
      buttonRendered.current = false;
    };
  }, [isOpen, scriptLoaded]);

  // Render PayPal button when script is loaded and dialog is open
  useEffect(() => {
    if (
      !isOpen ||
      !scriptLoaded ||
      !paypalContainerRef.current ||
      buttonRendered.current ||
      !window.paypal
    ) {
      return;
    }

    try {
      window.paypal
        .Buttons({
          style: {
            shape: "rect",
            color: "gold",
            layout: "vertical",
            label: "subscribe",
          },
          createSubscription: function (data: any, actions: any) {
            return actions.subscription.create({
              plan_id: planId,
            });
          },
          onApprove: async function (data: any) {
            try {
              const result = await updateUserSubscription({
                plan_id: planId,
                subscriptionId: data.subscriptionID,
                status: "active",
              });

              if (result.success) {
                toast.success("Subscription Activated", {
                  description: "Your subscription was successfully updated",
                });
                setIsOpen(false);
              } else {
                throw new Error(
                  result.error || "Failed to update subscription"
                );
              }
            } catch (error) {
              console.error("Subscription approval error:", error);
              toast.error("Subscription Error", {
                description:
                  error instanceof Error
                    ? error.message
                    : "Failed to process subscription",
              });
            }
          },
          onError: (err: Error) => {
            console.error("PayPal error:", err);
            toast.error("Payment Error", {
              description:
                err.message || "An error occurred during payment processing",
            });
          },
        })
        .render(paypalContainerRef.current);

      buttonRendered.current = true;
    } catch (error) {
      console.error("Error rendering PayPal button:", error);
      toast.error("Payment Error", {
        description: "Failed to initialize payment button",
      });
    }
  }, [scriptLoaded, isOpen, planId]);

  // If user already has a plan (isSelected), show revise/upgrade/downgrade button
  if (!isSelected && !planId) {
    return (
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="default">Subscribe</Button>
        </AlertDialogTrigger>

        <AlertDialogContent className="p-4 w-fit max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Your Subscription</AlertDialogTitle>
            <AlertDialogDescription className="p-2">
              Please use the button below to complete your subscription process.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div
            ref={paypalContainerRef}
            id={`paypal-button-container-${planId}`}
            className="min-h-[200px] flex items-center justify-center"
          />

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // If user doesn't have a plan, show the subscription dialog
  return (
    <SubscriptionReviseButton
      subscriptionId={SubscriptionId || ""}
      newPlanId={planId}
    />
  );
}
