import { randomUUID } from "node:crypto";
import {
  normalizeCityForCapi,
  normalizeCountryForCapi,
  normalizePhoneForCapi,
  sha256Lower,
} from "./hash";
import type { CustomerPayload } from "./types";

const META_GRAPH_VERSION = "v25.0";

/**
 * Fire-and-forget POST to Meta Conversions API. Sends the conversion as
 * TWO events in a single HTTP call:
 *
 *  - "Purchase" (standard) — used by Meta's optimization algorithm and
 *    AEM iOS auto-priority (Purchase is auto-priority 1, so iOS
 *    attribution works without us manually claiming a slot).
 *  - args.eventName (custom, e.g. "sales") — internal source-of-truth
 *    label our media buyer team optimizes reports against.
 *
 * Both events share event_id, event_source_url, user_data, and
 * custom_data. Same event_id means a duplicate fire (e.g. from the
 * webhook safety net running in a different Vercel Lambda than
 * verify-payment) is deduplicated server-side by Meta within a 48h
 * window — Events Manager shows one Purchase + one sales per order.
 *
 * user_data carries six hashed PII fields (em, ph, fn, ln, ct, country)
 * plus four raw server-context fields (fbc, fbp, client_ip_address,
 * client_user_agent). This combo is what gets us EMQ >= 9/10 and
 * keeps CPR down.
 *
 * Callers gate this to: brand domain + production Cashfree mode +
 * amount > ₹1 (see lib/env.ts + verify-payment route).
 *
 * Spec ref: https://developers.facebook.com/docs/marketing-api/conversions-api
 */
export async function fireMetaCapiPurchase(args: {
  customer: CustomerPayload;
  /** Custom event name fired alongside the standard "Purchase". */
  eventName: string;
  value: number;
  currency: string;
  paymentId: string;
  /** Page URL where the conversion originated. Server resolves this
   *  from request body or falls back to a hardcoded production URL. */
  eventSourceUrl: string;
  /** Optional category — sent as custom_data.kind when non-empty. */
  kind?: string;
  clientIp: string;
  clientUserAgent: string;
  fbc?: string;
  fbp?: string;
}): Promise<"ok" | "err" | "timeout" | "skipped"> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  console.log(
    `[capi] fire start events=Purchase,${args.eventName} paymentId=${args.paymentId} value=${args.value} url=${args.eventSourceUrl} hasCreds=${Boolean(pixelId && accessToken)}`,
  );
  if (!pixelId || !accessToken) {
    console.warn(
      "[capi] META_PIXEL_ID or META_CAPI_ACCESS_TOKEN not set — skipping CAPI fire",
    );
    return "skipped";
  }

  const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${pixelId}/events?access_token=${accessToken}`;

  // ---- user_data: 7 hashed PII fields + 4 raw server-context fields ----
  // Short Meta codes (em, ph, fn, ln, ct, country, external_id) per
  // Meta's spec. All hashed values are SHA-256, lowercase hex.
  // Normalization rules live in lib/hash.ts and match what client-side
  // MAM (lib/analytics.ts buildHashedMatching) normalizes pre-pixel,
  // so the resulting hashes are byte-identical for the same user
  // across browser and server. external_id = sha256(normalized email)
  // gives Meta a stable, deterministic cross-channel join key worth
  // ~21% EMQ uplift per their dataset suggestions.
  const emailHash = sha256Lower(args.customer.email);
  const userData: Record<string, unknown> = {
    em: [emailHash],
    ph: [sha256Lower(normalizePhoneForCapi(args.customer.phone))],
    fn: [sha256Lower(args.customer.firstName)],
    ln: [sha256Lower(args.customer.lastName)],
    external_id: [emailHash],
  };
  if (args.customer.city) {
    const normalizedCity = normalizeCityForCapi(args.customer.city);
    if (normalizedCity) userData.ct = [sha256Lower(normalizedCity)];
  }
  if (args.customer.countryCode) {
    const normalizedCountry = normalizeCountryForCapi(args.customer.countryCode);
    if (normalizedCountry) userData.country = [sha256Lower(normalizedCountry)];
  }
  // Server-context fields are sent RAW (Meta uses them as matching
  // signals — hashing them would break matching).
  if (args.fbc) userData.fbc = args.fbc;
  if (args.fbp) userData.fbp = args.fbp;
  if (args.clientUserAgent) userData.client_user_agent = args.clientUserAgent;
  if (args.clientIp) userData.client_ip_address = args.clientIp;

  // ---- custom_data: shared between both events ----
  const customData: Record<string, unknown> = {};
  if (args.currency) customData.currency = args.currency;
  if (args.value) customData.value = args.value;
  if (args.kind) customData.kind = args.kind;
  if (args.paymentId) customData.payment_id = args.paymentId;

  // ---- Shared event body ----
  const eventTime = Math.floor(Date.now() / 1000);
  const eventId = args.paymentId || randomUUID();
  const sharedBody = {
    event_time: eventTime,
    event_id: eventId,
    event_source_url: args.eventSourceUrl,
    action_source: "website" as const,
    user_data: userData,
    ...(Object.keys(customData).length > 0 ? { custom_data: customData } : {}),
  };

  const payload = {
    data: [
      { event_name: "Purchase", ...sharedBody },
      { event_name: args.eventName, ...sharedBody },
    ],
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "<no body>");
      console.warn(
        `[capi] Meta returned ${res.status} for payment ${args.paymentId}: ${text}`,
      );
      return "err";
    }
    const respBody = await res.text().catch(() => "<no body>");
    console.log(
      `[capi] Meta CAPI OK ${res.status} for payment ${args.paymentId} resp=${respBody.slice(0, 200)}`,
    );
    return "ok";
  } catch (err) {
    console.warn(
      `[capi] Meta CAPI fire failed for payment ${args.paymentId}:`,
      err instanceof Error ? err.message : err,
    );
    if (err instanceof Error && err.name === "AbortError") return "timeout";
    return "err";
  } finally {
    clearTimeout(timeoutId);
  }
}
