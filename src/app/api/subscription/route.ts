import { query } from "@/lib/db";
import { getAccessToken, PAYPAL_API } from "@/lib/paypal";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

interface SubscriptionResponse {
  id: string;
  status: string;
  plan_id: string;
  links?: Array<{
    rel: string;
    href: string;
    method: string;
  }>;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { planId, subscriber } = await req.json();

    // 1. Get PayPal access token
    const token = await getAccessToken();
    console.log("PayPal access token:", token);

    // 2. Create PayPal subscription
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
          return_url: `${process.env.APP_URL}/subscription/complete`,
          cancel_url: `${process.env.APP_URL}/subscription/cancel`,
        },
      }),
    });

    if (!subRes.ok) {
      const errorData = await subRes.json();
      console.error("PayPal subscription error:", errorData);
      return NextResponse.json(
        { error: "Failed to create subscription", details: errorData },
        { status: subRes.status }
      );
    }

    const subData: SubscriptionResponse = await subRes.json();
    const subscriptionId = subData.id;
    const status = subData.status;
    console.log(subData);
    const approvalUrl = subData.links?.find((l) => l.rel === "approve")?.href;

    if (!approvalUrl) {
      throw new Error("No approval URL found in PayPal response");
    }

    // 3. Update database and Clerk metadata in parallel
    // 3.1 identify the plan into the database
    const { rows } = await query(`SELECT * FROM plans WHERE id = $1`, [planId]);
    const plan = rows[0];

    const [dbUpdate, clerkUpdate] = await Promise.allSettled([
      // Update database
      query(
        `UPDATE users 
         SET subscription_id = $1, subscription_status =$3, paypal_plan_id = $4, plan_id = $5, onboarded = true
         WHERE id = $2`,
        [subscriptionId, userId, status, planId, plan?.id]
      ),

      // Update Clerk metadata
      fetch(`https://api.clerk.dev/v1/users/${userId}/metadata`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_metadata: {
            plan_id: planId,
            subscription: {
              subscription_plan: plan?.name || "free",
              subscription_id: subscriptionId || "",
              subscription_status: status || "active",
              subscription_frequency: plan?.frequency || "monthly",
            },
          },
        }),
      }),
    ]);

    // Log any errors from parallel operations
    if (dbUpdate.status === "rejected") {
      console.error("Database update failed:", dbUpdate.reason);
    }

    if (clerkUpdate.status === "rejected") {
      console.error("Clerk metadata update failed:", clerkUpdate.reason);
    } else if (clerkUpdate.value) {
      const clerkResponse = await clerkUpdate.value.json();
      if (!clerkUpdate.value.ok) {
        console.error("Clerk API error:", clerkResponse);
      }
    }

    return NextResponse.json({ approvalUrl }, { status: 200 });
  } catch (error) {
    console.error("Subscription creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
