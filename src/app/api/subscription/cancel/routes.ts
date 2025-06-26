import { getAccessToken, PAYPAL_API } from "@/lib/paypal";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { OldSubscriptionId, reason } = await req.json();

    // Validate required fields
    if (!OldSubscriptionId) {
      return NextResponse.json(
        { success: false, error: "SubscriptionId is required" },
        { status: 400 }
      );
    }

    // Get PayPal access token
    const accessToken = await getAccessToken();

    // Cancel PayPal subscription
    const paypalRes = await fetch(
      `${PAYPAL_API}/v1/billing/subscriptions/${OldSubscriptionId}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          reason: reason || "User requested an update to their subscription",
        }),
      }
    );
    // Handle PayPal response
    if (paypalRes.status === 204) {
      return NextResponse.json(
        { success: true, data: { message: "Subscription cancelled" } },
        { status: 200 }
      );
    }
    // Forward PayPal API errors
    const errorPayload = await paypalRes.json();
    return NextResponse.json(
      { success: false, error: errorPayload },
      { status: paypalRes.status }
    );
  } catch (error) {
    console.error("Internal server error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
