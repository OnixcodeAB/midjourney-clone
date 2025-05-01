import { query } from "./db";

// Helper to parse and validate the aspect ratio
export function parseAspect(ratio: string): { width: number; height: number } {
  const [w, h] = ratio.split("x").map(Number);
  if (!w || !h) throw new Error(`Invalid aspect ratio: '${ratio}'`);
  return { width: w, height: h };
}

// Helper to log into PollLog
export async function logPoll(status: string, count: number, errorMsg: string) {
  try {
    await query(
      `INSERT INTO "PollLog" (status, updatedcount, error)
             VALUES ($1, $2, $3)`,
      [status, count, errorMsg]
    );
  } catch (logErr) {
    console.error("[LOG_POLL_ERROR]", logErr);
  }
}
