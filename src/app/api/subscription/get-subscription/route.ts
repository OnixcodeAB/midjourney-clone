import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";
import { cacheResult, getCached, invalidateCache } from "@/lib/redis";
import { getAuth } from "@clerk/nextjs/server";
import { getAccessToken, PAYPAL_API } from "@/lib/paypal";

// Fetch the current subscription's plan_id
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const { subscriptionId } = await params;

  try {
    const accessToken = await getAccessToken();
    const paypal = await fetch(
      `${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!paypal.ok) {
      const err = await paypal.text();
      return NextResponse.json({ error: err });
    }
    const data = await paypal.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.log(err);
    return NextResponse.json({
      status: 500,
      error: "Internal Server Error",
      err,
    });
  }
}
