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

/**
 * Fire the Meta Pixel standard 'Purchase' event from the browser, paired
 * with the server CAPI Purchase event of the same event_id for Meta's
 * dedup window (48h).
 *
 * Why we fire from BOTH sides (browser + server):
 *  - Server CAPI is the authoritative source (not blocked by ad blockers
 *    or iOS tracking prevention) — guarantees every paid conversion is
 *    counted.
 *  - Browser pixel pairs with CAPI so Meta dedupes by event_id. Without
 *    a browser pair, Meta's dedup coverage drops to 0% AND Meta's
 *    Automatic Event Detection synthesises uncontrolled browser Purchase
 *    events from page metadata — those have no eventID, can't be deduped,
 *    and inflate the reported count.
 *
 * Per Meta dedup spec
 * (https://developers.facebook.com/documentation/ads-commerce/conversions-api/deduplicate-pixel-and-server-events):
 *   "Browser eventID must equal server event_id, and event_name must
 *   match exactly. Both events must arrive within a 48-hour window."
 *
 * Call this AFTER setMetaAdvancedMatching so the Purchase event inherits
 * the hashed identity for 9+/10 EMQ on the browser side. The same gating
 * (window.fbq present) applies — so this no-ops on localhost / vercel.app
 * preview URLs where the pixel script doesn't load.
 *
 * IMPORTANT: only call from the paid success path. If the server skips
 * CAPI for free/test orders, the browser must skip too — otherwise the
 * browser Purchase has no pair to dedupe against and counts as real.
 */
export function trackPurchasePixel(params: {
  /** Used as eventID — MUST equal the server event_id (cf_payment_id). */
  paymentId: string;
  /** Numeric, major units (rupees). Same value as CAPI. */
  value: number;
  /** ISO 4217, e.g. 'INR'. */
  currency?: string;
  /** Display label in Events Manager. */
  contentName?: string;
}): void {
  if (typeof window === "undefined") return;
  if (typeof window.fbq !== "function") return;

  window.fbq(
    "track",
    "Purchase",
    {
      value: params.value,
      currency: params.currency ?? clientConfig.brand.currency ?? "INR",
      content_name: params.contentName ?? `${clientConfig.brand.name} Webinar`,
    },
    { eventID: params.paymentId },
  );
}
