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
    if (scriptLoaded || scriptRef.current) return;

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
    script.dataset.sdkIntegrationSource = "button-factory";
    script.async = true;
    scriptRef.current = script;

    script.onload = () => setScriptLoaded(true);
    script.onerror = () => console.error("PayPal SDK failed to load");

    document.body.appendChild(script);

    return () => {
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        document.body.removeChild(scriptRef.current);
      }
    };
  }, [scriptLoaded]);

  // Render PayPal button
  useEffect(() => {
    if (!scriptLoaded || !paypalContainerRef.current) return;

    // Clean up previous button instance
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
    });

    buttonInstanceRef.current.render(paypalContainerRef.current);
  }, [scriptLoaded, currentSubscriptionId, newPlanId]);

  return <div ref={paypalContainerRef} id="paypal-button-container" />;
}
