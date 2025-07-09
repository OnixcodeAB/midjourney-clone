import { query } from "@/lib/db";
import { cacheResult, getCached, redis } from "@/lib/redis"; // Make sure this path matches your project structure

const CACHE_TTL = 60 * 2; // 2 minutes

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
      // Fetch the user's plan limits
      //This query gets the maximum number of images a user can upload at different quality levels based on their subscription plan.
      //Returns three numbers: how many low, medium, and high quality images they're allowed to upload
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
      // Fetch the user's usage for the current month
      //This query counts how many images the user has uploaded in the current month, grouped by quality type.
      //Returns a list of objects with quality type and count, e.g. { quality: 'low', count: 5 }
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
    // Transform usage rows into a more usable format
    // This creates an object where each quality type (low, medium, high) maps to the count of images uploaded
    // e.g. { low: 5, medium: 3, high: 2 }
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

    //console.log({ current: current, limit: limit, quality: quality });

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
