/** Runs once when the server starts: background housekeeping so nothing depends on a visitor triggering it. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { releaseExpired } = await import("./lib/orders");
  const { pruneRateHits } = await import("./lib/ratelimit");
  const { retryUnverifiedPayments } = await import("./lib/payhere-retry");
  const run = async () => {
    try {
      await releaseExpired();
      await retryUnverifiedPayments();
      await pruneRateHits();
    } catch (e) {
      console.error("[housekeeping]", e instanceof Error ? e.message : e);
    }
  };
  setTimeout(() => void run(), 15_000);
  setInterval(() => void run(), Math.max(5, Number(process.env.HOUSEKEEPING_SECONDS || 300)) * 1000).unref();
}
