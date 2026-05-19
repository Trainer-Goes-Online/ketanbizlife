import { clientConfig } from "@/client.config";

declare global {
  interface Window {
    fbq?: (
      command: string,
      ...args: unknown[]
    ) => void;
  }
}

export interface AdvancedMatchingData {
  email?: string;
  /** Full E.164-ish phone (with or without "+", will be normalized to digits). */
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  /** 2-letter ISO 3166-1 alpha-2 country code (e.g. "IN"). */
  country?: string;
}

/**
 * Manual Advanced Matching (MAM) for the Meta Pixel.
 *
 * Calls `fbq('init', PIXEL_ID, matchingObject)` a SECOND time with
 * normalized buyer identity. Meta's pixel library SHA-256 hashes the
 * values client-side before transmission — raw PII never leaves the
 * browser. All subsequent pixel events (including Meta's auto-PageView
 * on SPA route changes) inherit the matching signals, boosting EMQ
 * for retargeting audiences and cross-device attribution.
 *
 * Must be called BEFORE `router.push("/thank-you")` — Meta's auto
 * PageView for the new URL fires immediately on route change, so MAM
 * must be set on the current pixel context before the navigation.
 *
 * Gating: the helper no-ops on localhost / vercel.app preview URLs
 * because `window.fbq` is only defined when our gated pixel init
 * script in app/layout.tsx has run (which only runs on the production
 * brand domain). No extra host check needed here.
 *
 * Normalization mirrors what lib/hash.ts does server-side, so the
 * hashes coming from MAM (client) and CAPI (server) are byte-identical
 * for the same user — letting Meta confidently match them.
 */
export function setMetaAdvancedMatching(data: AdvancedMatchingData): void {
  if (typeof window === "undefined") return;
  if (typeof window.fbq !== "function") return;

  const pixelId = clientConfig.analytics.metaPixelId;
  if (!pixelId) return;

  const matching: Record<string, string> = {};

  if (data.email) {
    const em = data.email.trim().toLowerCase();
    if (em) matching.em = em;
  }
  if (data.phone) {
    const ph = data.phone.replace(/\D/g, "");
    if (ph) matching.ph = ph;
  }
  if (data.firstName) {
    const fn = data.firstName.trim().toLowerCase();
    if (fn) matching.fn = fn;
  }
  if (data.lastName) {
    const ln = data.lastName.trim().toLowerCase();
    if (ln) matching.ln = ln;
  }
  if (data.city) {
    // Meta spec: lowercase, a-z only (no spaces, no punctuation).
    const ct = data.city.trim().toLowerCase().replace(/[^a-z]/g, "");
    if (ct) matching.ct = ct;
  }
  if (data.country) {
    // Meta spec: lowercase 2-letter ISO alpha-2.
    const country = data.country.trim().toLowerCase().slice(0, 2);
    if (country) matching.country = country;
  }

  if (Object.keys(matching).length === 0) return;

  // Pass RAW normalized values — fbq hashes them internally. NEVER
  // pre-hash on the client; that would prevent Meta from matching.
  window.fbq("init", pixelId, matching);
}
