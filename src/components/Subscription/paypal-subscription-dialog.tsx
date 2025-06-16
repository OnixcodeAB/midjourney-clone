import { useState, useEffect, useRef } from "react";
import { updateUserSubscription } from "@/app/actions/subscriptions/updateUserSubscription";
import { toast } from "sonner";

declare global {
  interface Window {
    paypal: any; // Declarar paypal para evitar errores de TypeScript
  }
}

interface PayPalSubscriptionButtonProps {
  planId: string; // El ID del plan de PayPal
  isSelected: boolean;
}

export function PayPalSubscriptionButton({
  planId,
  isSelected,
}: PayPalSubscriptionButtonProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const buttonRendered = useRef(false);

  // Cargar el script de PayPal
  useEffect(() => {
    if (scriptLoaded) return;

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
  }, [scriptLoaded]);

  // Renderizar el botón de PayPal
  useEffect(() => {
    if (!scriptLoaded || !paypalContainerRef.current || buttonRendered.current)
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
    }
  }, [scriptLoaded, planId]);

  return (
    <div ref={paypalContainerRef} id={`paypal-button-container-${planId}`}>
      {!scriptLoaded && <p>Loading PayPal button...</p>}
    </div>
  );
}
