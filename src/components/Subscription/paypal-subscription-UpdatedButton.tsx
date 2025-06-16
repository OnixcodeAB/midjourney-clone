import { use, useEffect, useRef, useState } from "react";

export function PayPalSubscriptionUpdatedButton({
  currentSubsCriptionId,
  newPlanId,
}: {
  currentSubsCriptionId: string;
  newPlanId: string;
}) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
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
      document.body.removeChild(script);
      setScriptLoaded(false);
      buttonRendered.current = false;
    };
  }, [scriptLoaded]);

  useEffect(() => {
    if (scriptLoaded && paypalContainerRef.current && !buttonRendered.current) {
      window.paypal
        .Buttons({
          style: {
            shape: "rect",
            color: "gold",
            layout: "vertical",
            label: "subscribe",
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
  }, [scriptLoaded]);

  return (
    <div ref={paypalContainerRef} id="paypal-button-container">
      {!scriptLoaded && <p>Loading PayPal button...</p>}
    </div>
  );
}
