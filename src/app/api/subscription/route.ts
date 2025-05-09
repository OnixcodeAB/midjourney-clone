import { query } from "@/lib/db";
import { getAccessToken, PAYPAL_API } from "@/lib/paypal";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { planId, subscriber } = await req.json();
  let token: string;

  try {
    token = await getAccessToken();
  } catch (err: any) {
    console.log("Paypal token error", err);
    return NextResponse.json({ error: "Paypal auth failed" }, { status: 500 });
  }

  // 1. Create subscription via Rest API
  const subRes = await fetch(`${PAYPAL_API}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      plan_id: planId,
      subscriber: subscriber ?? {},
      application_context: {
        brand_name: "Imagen AI Studio",
        user_action: "SUBSCRIBE_NOW",
        return_url: `${process.env.APP_URL}/onboarding/complete`,
        cancel_url: `${process.env.APP_URL}/onboarding/cancel`,
      },
    }),
  });
  if (!subRes.ok) {
    const errorData = await subRes.text();
    console.log("Paypal subscription error", errorData);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: subRes.status }
    );
  }

  const subData = await subRes.json();
  const subscriptionId = subData.id;
  const approvalUrl = subData.links.find((l: any) => l.rel === "approve")?.href;

  // 2. Persist subscription in DB (status=CREATED)
  await query(
    `UPDATE users SET subscription_id = $1, subscription_status='ACTIVATED' WHERE id = $2`,
    [subscriptionId, userId]
  );

  // 3. Return the paypal approval URL to the client
  return NextResponse.json({ approvalUrl }, { status: 200 });
}
