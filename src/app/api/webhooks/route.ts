import { query } from "@/lib/db";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);
    const { id } = evt.data;
    const eventType = evt.type;
    
    if (eventType === "user.created") {
      // Extrac relevant fields
      const userId = id;
      const email = evt.data.email_addresses?.[0]?.email_address ?? null;
      const fullName = `${evt.data.first_name ?? ""} ${
        evt.data.last_name ?? ""
      }`.trim();

      // Insert into DB
      await query(
        `INSERT INTO user (id, email, name) VALUES ($1, $2, $3)
        ON CONFLICT (id) DO NOTHING`,
        [userId, email, fullName]
      );
      console.log(`Inserted new user ${userId}: ${fullName} (${email})`);
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
