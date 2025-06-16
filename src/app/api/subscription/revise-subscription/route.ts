import { getAccessToken, PAYPAL_API } from "@/lib/paypal";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { subscriptionId, newPlanId } = await req.json();

    // Validate required fields
    if (!subscriptionId || !newPlanId) {
      return NextResponse.json(
        { success: false, error: "subscriptionId and newPlanId are required" },
        { status: 400 }
      );
    }

    // Get PayPal access token
    const accessToken = await getAccessToken();
    console.log(accessToken);

    // Prepare subscription update payload
    const patchBody = [
      {
        op: "replace",
        path: "/plan/plan_id",
        value: newPlanId,
      },
    ];

    // Update PayPal subscription
    const paypalRes = await fetch(
      `${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}/revise`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ plan_id: newPlanId }),
      }
    );

    // Handle PayPal response
    if (paypalRes.status === 204) {
      return NextResponse.json(
        { success: true, data: { message: "Subscription updated" } },
        { status: 200 }
      );
    }

    // Forward PayPal API errors
    const errorPayload = await paypalRes.json();
    return NextResponse.json(
      { success: false, error: errorPayload },
      { status: paypalRes.status }
    );
  } catch (err: any) {
    console.error("Internal server error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
