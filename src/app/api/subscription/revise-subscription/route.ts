import { getAccessToken, PAYPAL_API } from "@/lib/paypal";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  success: boolean;
  data?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method Not Allowed" });
  }

  const {
    subscriptionId,
    newPlanId,
  }: { subscriptionId?: string; newPlanId?: string } = req.body;

  if (!subscriptionId || !newPlanId) {
    return res.status(400).json({
      success: false,
      error: "subscriptionId and newPlanId are required",
    });
  }
  let accessToken: string;
  try {
    accessToken = await getAccessToken();
  } catch (error: any) {
    console.log("Error fetching Paypal token", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to get PayPal access token" });
  }

  // Build the PATCH payload to revise (upgrade/downgrade) the subscription
  const patchBody = [
    {
      op: "replace",
      path: "/plan_id",
      value: newPlanId,
    },
  ];
  try {
    const paypalRes = await fetch(
      `${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patchBody),
      }
    );

    if (paypalRes.status === 204) {
      // PayPal returns 204 No Content when revise is successful
      return res
        .status(200)
        .json({ success: true, data: { message: "Subscription updated" } });
    }

    // If PayPal sends an error payload, forward it
    const errorPayload = await paypalRes.json();
    console.error("PayPal revise error:", errorPayload);
    return res
      .status(paypalRes.status)
      .json({ success: false, error: JSON.stringify(errorPayload) });
  } catch (err: any) {
    console.error("Fetch error when revising subscription:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
}
