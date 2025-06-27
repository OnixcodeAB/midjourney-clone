import React from "react";
import type { JSX } from "react";
import { updateUserSubscription } from "@/app/actions/subscriptions/updateUserSubscription";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

// Extend Window interface to include PayPal for TypeScript
interface Props {
  currentSubscriptionId: string;
  newPlanId: string;
  onOpenChange?: (open: boolean) => void; // Optional callback for open state change
}

/**
 * Renders a PayPal button for updating a user's subscription.
 * It loads the PayPal SDK, renders a subscription revision button,
 * and handles the approval and error callbacks. On successful subscription update,
 * it displays a success toast and a confetti animation.
 *
 * @param {Props} { currentSubscriptionId, newPlanId } - The ID of the current subscription
 * to be revised and the ID of the new plan to subscribe to.
 * @returns {JSX.Element} A div element that will contain the PayPal button.
 */

export function PayPalSubscriptionUpdateButton({
  currentSubscriptionId,
  newPlanId,
  onOpenChange
}: Props): JSX.Element {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const buttonInstanceRef = useRef<any>(null); // Store PayPal button instance

  // Cleanup resources on component unmount
  useEffect(() => {
    return () => {
      // Clean up PayPal button instance
      if (buttonInstanceRef.current) {
        buttonInstanceRef.current.close();
        buttonInstanceRef.current = null;
      }

      // Clean up PayPal SDK script
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        document.body.removeChild(scriptRef.current);
      }
    };
  }, []);

  // Load PayPal SDK
  useEffect(() => {
    // Prevent multiple script loads
    if (scriptLoaded || scriptRef.current) return;

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
    script.dataset.sdkIntegrationSource = "button-factory";
    script.async = true;
    scriptRef.current = script; // Store reference to the script element

    script.onload = () => setScriptLoaded(true);
    script.onerror = () => console.error("PayPal SDK failed to load");

    document.body.appendChild(script);

    // Cleanup function for this effect: remove the script if component unmounts before load
    return () => {
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        document.body.removeChild(scriptRef.current);
      }
    };
  }, [scriptLoaded]); //Depend on scriptLoaded to avoid re-running

  // Render PayPal button
  useEffect(() => {
    if (!scriptLoaded || !paypalContainerRef.current) return;

    // Clean up previous button instance to prevent duplicate rendering
    if (buttonInstanceRef.current) {
      buttonInstanceRef.current.close();
      buttonInstanceRef.current = null;
    }

    // Ensure container is empty
    if (paypalContainerRef.current.hasChildNodes()) {
      paypalContainerRef.current.innerHTML = "";
    }

    // Render new button
    buttonInstanceRef.current = window.paypal.Buttons({
      style: {
        shape: "rect",
        color: "gold",
        layout: "vertical",
        label: "",
      },
      /**
       * Creates the subscription revision order for PayPal.
       * @param {any} data - Data passed by PayPal.
       * @param {any} actions - Actions provided by PayPal to revise the subscription.
       * @returns {Promise<string>} A promise that resolves with the PayPal order ID.
       */
      createSubscription: function (data: any, actions: any): Promise<string> {
        return actions.subscription.revise(currentSubscriptionId, {
          plan_id: newPlanId,
        });
      },
      /**
       * Callback function executed when the PayPal payment is approved.
       * @param {any} data - Data containing subscription details from PayPal.
       */
      onApprove: async function (data: any): Promise<void> {
        try {
          const result = await updateUserSubscription({
            plan_id: newPlanId,
            subscriptionId: data.subscriptionID,
            status: "active",
            OldSubscriptionId: currentSubscriptionId,
          });
          if (result.success) {
            // Optionally, you can call onOpenChange if provided
           
              if (onOpenChange) {
                onOpenChange(false); // Close the modal or perform any other action
              }
            
            toast.success("Subscription Activated", {
              description: "Your subscription was successfully updated",
            });
            // Trigger confetti animation on success
            confetti({
              particleCount: 500,
              spread: 200,
              origin: { y: 0.5 }, // Originates from the middle of the screen vertically
            });
          } else {
            throw new Error(result.error || "Failed to update subscription");
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
    });

    // Render the PayPal button into the designated container
    buttonInstanceRef.current.render(paypalContainerRef.current);
  }, [scriptLoaded, currentSubscriptionId, newPlanId]);

  return <div ref={paypalContainerRef} id="paypal-button-container" />;
}
