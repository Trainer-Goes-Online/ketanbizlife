/**
 * Tiny shared HTTP helpers for route handlers.
 *
 * Lives at lib/ because both /api/cashfree/create-order (to snapshot the
 * client IP into order_tags) and /api/cashfree/webhook (for diagnostic
 * logging) need the same logic. Keeping it here avoids drift between two
 * copy-pasted helpers.
 */

/**
 * Extracts the originating client IP from the standard Vercel / proxy
 * headers. Falls back to an empty string when neither header is present
 * (callers should treat empty as "unknown" and skip the field rather
 * than passing it to downstream APIs).
 *
 * Vercel injects `x-forwarded-for` as a comma-separated list with the
 * client's IP first, then each proxy hop. We take the first entry.
 */
export function extractClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "";
}
