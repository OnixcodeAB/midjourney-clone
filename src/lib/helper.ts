import { query } from "./db";

// Helper to parse and validate the aspect ratio
export function parseAspect(ratio: string|undefined): { width: number; height: number } {
  if (!ratio) throw new Error("Aspect ratio is undefined");
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

// --- Helper: Log errors in PollLog table ---
export async function logError({ status, error }: { status: string; error: string }) {
  try {
    await query(
      `INSERT INTO "PollLog" (status, updatedcount, error) VALUES ($1, $2, $3)`,
      [status, 0, error]
    );
  } catch (logErr) {
    // Avoid breaking main flow if logging fails
    console.error("[POLL_LOG_INSERT_ERROR]", logErr);
  }
}