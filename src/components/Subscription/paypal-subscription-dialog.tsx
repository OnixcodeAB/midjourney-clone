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

declare global {
  interface Window {
    paypal: any; // Declare paypal to avoid TypeScript errors
  }
}

interface PayPalSubscriptionDialogProps {
  planId: string; // The PayPal Plan ID
  isSelected: boolean;
  clientId?: string; // Your PayPal Client ID
}

export function PayPalSubscriptionButton({
  planId,
  isSelected,
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
    script.onerror = () => console.error("PayPal SDK failed to load");

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      setScriptLoaded(false);
      buttonRendered.current = false;
    };
  }, [isOpen]);

  // Render PayPal button when script is loaded and dialog is open
  useEffect(() => {
    if (
      !isOpen ||
      !scriptLoaded ||
      !paypalContainerRef.current ||
      buttonRendered.current
    )
      return;

    if (window.paypal) {
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
          onApprove: function (data: any) {
            alert(`Subscription created with ID: ${data.subscriptionID}`);
          },
        })
        .render(paypalContainerRef.current);

      buttonRendered.current = true;
    }
  }, [scriptLoaded, isOpen]);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant={isSelected ? "outline" : "default"}
          disabled={isSelected}
        >
          {isSelected ? "Seleted" : "Subscribe"}
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

        {/* PayPal container - only renders when dialog is open */}
        <div
          className=""
          ref={paypalContainerRef}
          id={`paypal-button-container-${planId}}`}
        />

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
