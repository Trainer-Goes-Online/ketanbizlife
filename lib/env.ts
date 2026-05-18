import { clientConfig } from "@/client.config";

/**
 * Returns true only when the request was served against the production brand
 * domain (clientConfig.brand.domain). localhost, Vercel preview URLs, and the
 * default Vercel production URL all return false.
 *
 * Used to gate side-effects (Meta CAPI fires) so test environments never
 * pollute real ad-attribution data. The Pabbly webhook stays unaffected —
 * if you want to isolate Pabbly during tests, point PABBLY_WEBHOOK_URL at a
 * separate workflow.
 */
export function isProductionHost(request: Request): boolean {
  const rawHost = request.headers.get("host") ?? "";
  const hostname = rawHost.split(":")[0]?.toLowerCase() ?? "";
  return hostname === clientConfig.brand.domain.toLowerCase();
}
