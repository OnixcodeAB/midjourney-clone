import { query } from "@/lib/db";

export async function checkUsageLimit(userId: string, quality: QualityType) {
  try {
    const [{ rows: planRows }, { rows: usageRows }] = await Promise.all([
      query(
        `
        SELECT 
          p.low_quality_limit,
          p.medium_quality_limit,
          p.high_quality_limit
        FROM users u
        JOIN plans p ON u.plan_id = p.id
        WHERE u.id = $1
        LIMIT 1
      `,
        [userId]
      ),
      query(
        `
        SELECT quality, COUNT(*) AS count
        FROM "Image"
        WHERE user_id = $1 
          AND status IN ('pending', 'complete')
          AND DATE_TRUNC('month', createdat) = DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY quality
      `,
        [userId]
      ),
    ]);

    if (!planRows.length) {
      throw new Error("User plan not found");
    }

    const plan = planRows[0];
    const usage = usageRows.reduce((acc: Record<string, number>, row: any) => {
      acc[row.quality] = parseInt(row.count, 10);
      return acc;
    }, {});

    // Define the limits for each quality type
    const limits: Record<QualityType, number | null | undefined> = {
      low: plan.low_quality_limit,
      medium: plan.medium_quality_limit,
      high: plan.high_quality_limit,
    };

    // Check if the user has reached their monthly limit for the requested quality
    if (limits[quality] !== null && limits[quality] !== undefined) {
      if ((usage[quality] || 0) >= limits[quality]) {
        return {
          allowed: false,
          error: `Monthly ${quality}-quality generation limit reached. Upgrade your plan to generate more images.`,
        };
      }
    }

    return { allowed: true };
  } catch (error) {
    console.error("Error checking usage limits:", error);
    return { allowed: false, error: "Error checking usage limits" };
  }
}
