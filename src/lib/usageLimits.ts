import { query } from "@/lib/db";
import { cacheResult, getCached, redis } from "@/lib/redis"; // Make sure this path matches your project structure

const CACHE_TTL = 60 * 60; // 1 hour

export async function checkUsageLimit(
  userId: string,
  quality: QualityType
): Promise<UsageResult> {
  const cacheKey = `usage:${userId}:${quality}:${new Date().getMonth()}`;

  //Try cache first
  try {
    const cached = await getCached(cacheKey);
    if (cached) {
      return cached as UsageResult;
    }
  } catch (error) {
    console.error("Cache read error:", error);
  }

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

    //console.log({ Plan: planRows }, { Usage: usageRows });

    // Define the limits for each quality type
    const limits: Record<QualityType, number> = {
      low: plan.low_quality_limit,
      medium: plan.medium_quality_limit,
      high: plan.high_quality_limit,
    };

    const current = usage[quality] || 0;
    const limit = limits[quality];

    console.log({ current: current, limit: limit, quality: quality });

    // Check if the user has reached their monthly limit for the requested quality
    if (current >= limit) {
      const result = {
        allowed: false,
        error: `Monthly ${quality}-quality generation limit reached`,
        description: "Upgrade your plan to generate more images.",
        current,
        limit,
      };
      await cacheResult(cacheKey, CACHE_TTL, result);
      return result;
    }
    const result = {
      allowed: true,
      error: undefined,
      description: undefined,
      current,
      limit,
    };
    await cacheResult(cacheKey, CACHE_TTL, result);
    return result;
  } catch (error) {
    console.error("Error checking usage limits:", error);
    return { allowed: false, error: "Error checking usage limits" };
  }
}
