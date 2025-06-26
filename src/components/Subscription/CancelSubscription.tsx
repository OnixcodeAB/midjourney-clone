/**
 * Cancels a PayPal subscription
 * @param subscriptionId - The PayPal subscription ID to cancel
 * @param reason - Optional cancellation reason (default: "User requested cancellation")
 * @returns Promise with cancellation result
 */
export async function cancelPayPalSubscription(
  subscriptionId: string,
  reason: string = "User requested cancellation"
): Promise<{
  success: boolean;
  data?: { message: string };
  error?: any;
}> {
  try {
    if (!subscriptionId) {
      throw new Error("Subscription ID is required");
    }

    const response = await fetch("/api/subscriptions/cancel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        OldSubscriptionId: subscriptionId,
        reason: reason, // Optional: pass through to your endpoint if needed
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to cancel subscription",
      };
    }

    return {
      success: true,
      data: {
        message: data.data?.message || "Subscription cancelled successfully",
      },
    };
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
