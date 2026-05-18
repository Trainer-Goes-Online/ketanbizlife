/**
 * In-memory best-effort dedup for fire-and-forget integrations.
 *
 * Both the verify-payment route and the Cashfree webhook can fire Pabbly +
 * Meta CAPI for the same order. Whichever path runs first claims the orderId;
 * the second becomes a no-op. CAPI deduplicates server-side on event_id
 * (we pass cf_payment_id) so the only real risk is a duplicate Pabbly row
 * across Vercel cold starts — acceptable for a low-volume funnel.
 */

const TTL_MS = 24 * 60 * 60 * 1000; // 24h
const claims = new Map<string, number>();

function sweep(now: number): void {
  for (const [orderId, ts] of claims) {
    if (now - ts > TTL_MS) claims.delete(orderId);
  }
}

/**
 * Returns true on the first call for an orderId within the TTL window,
 * false on subsequent calls. Caller fires downstream integrations only
 * when this returns true.
 */
export function tryClaimOrder(orderId: string): boolean {
  if (!orderId) return false;
  const now = Date.now();
  sweep(now);
  if (claims.has(orderId)) return false;
  claims.set(orderId, now);
  return true;
}
