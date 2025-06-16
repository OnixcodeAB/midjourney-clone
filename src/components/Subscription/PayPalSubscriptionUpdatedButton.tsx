import { useEffect, useRef, useState } from "react";

interface Props {
  currentSubscriptionId: string; 
  newPlanId: string;
}

export function PayPalSubscriptionUpdateButton({
  currentSubscriptionId,
  newPlanId,
}: Props) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const buttonRendered = useRef(false);
  
  // Track previous props to detect changes
  const prevProps = useRef({ currentSubscriptionId, newPlanId });

  useEffect(() => {
    if (scriptLoaded) return;

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
    script.dataset.sdkIntegrationSource = "button-factory";
    script.async = true;

    scriptRef.current = script;

    script.onload = () => setScriptLoaded(true);
    script.onerror = () => console.error("PayPal SDK failed to load");

    document.body.appendChild(script);

    return () => {
      if (scriptRef.current) {
        document.body.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
      setScriptLoaded(false);
      buttonRendered.current = false;
    };
  }, []);

  useEffect(() => {
    // Check if props changed since last render
    const propsChanged = 
      prevProps.current.currentSubscriptionId !== currentSubscriptionId ||
      prevProps.current.newPlanId !== newPlanId;

    // Clean up previous button if props changed or script just loaded
    if (propsChanged || (scriptLoaded && !buttonRendered.current)) {
      if (paypalContainerRef.current && buttonRendered.current) {
        // Clear existing button
        while (paypalContainerRef.current.firstChild) {
          paypalContainerRef.current.removeChild(
            paypalContainerRef.current.firstChild
          );
        }
      }
      buttonRendered.current = false;
      prevProps.current = { currentSubscriptionId, newPlanId };
    }

    // Render new button if needed
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
            return actions.subscription.revise(currentSubscriptionId, {
              plan_id: newPlanId,
            });
          },
          onApprove: async function (data: any) {
            console.log("Subscription update approved:", data);
            // Add your post-approval logic here
          },
          onError: (err: Error) => {
            console.error("PayPal button error:", err);
          },
        })
        .render(paypalContainerRef.current);

      buttonRendered.current = true;
    }
  }, [scriptLoaded, currentSubscriptionId, newPlanId]);

  return <div ref={paypalContainerRef} id="paypal-button-container" />;
}