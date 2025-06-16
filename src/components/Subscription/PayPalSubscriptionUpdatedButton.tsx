import { useEffect, useRef, useState } from "react";

interface Props {
  currentSubsCriptionId: string; // The current subscription ID to update
  newPlanId: string; // The new plan ID to switch to
}

export function PayPalSubscriptionUpdatedButton({
  currentSubsCriptionId,
  newPlanId,
}: Props) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const buttonRendered = useRef(false);

  useEffect(() => {
    if (scriptLoaded) return;

    // Load PayPal script only once
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
    script.dataset.sdkIntegrationSource = "button-factory";
    script.async = true;

    script.onload = () => setScriptLoaded(true);
    script.onerror = () => console.error("PayPal SDK failed to load");

    document.body.appendChild(script);

    return () => {
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        document.body.removeChild(scriptRef.current);
      }
      setScriptLoaded(false);
      buttonRendered.current = false;
    };
  }, []);

  useEffect(() => {
    if (scriptLoaded && paypalContainerRef.current && !buttonRendered.current) {
      window.paypal
        .Buttons({
          style: {
            shape: "rect",
            color: "gold",
            layout: "vertical",
            label: "",
          },
          createSubscription: function (data: any, actions: any) {
            return actions.subscription.revise(currentSubsCriptionId, {
              plan_id: newPlanId,
            });
          },
          onApprove: async function (data: any) {
            console.log("Subscription approved:", data);
          },
        })
        .render(paypalContainerRef.current);

      buttonRendered.current = true;
    }
  }, [scriptLoaded, currentSubsCriptionId, newPlanId]);

  return <div ref={paypalContainerRef} id="paypal-button-container"></div>;
}
