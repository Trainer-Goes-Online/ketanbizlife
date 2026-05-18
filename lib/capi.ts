import { randomUUID } from "node:crypto";
import { normalizePhoneForCapi, sha256Lower } from "./hash";
import type { CustomerPayload } from "./types";

const META_GRAPH_VERSION = "v25.0";

/**
 * Fire-and-forget POST to Meta Conversions API. Matches the project's
 * agreed-on payload shape:
 *
 * - Single event in data[], event_name from caller (we use "sales")
 * - user_data: hashed email + phone only (no name/city/country)
 * - fbc / fbp / client_user_agent / client_ip_address included when present
 * - custom_data: currency, value, kind, payment_id (only the fields with values)
 *
 * Callers gate this to the production brand domain (see lib/env.ts) so the
 * pixel never receives test traffic from localhost or vercel.app URLs.
 *
 * Spec ref: https://developers.facebook.com/docs/marketing-api/conversions-api
 */
export async function fireMetaCapiPurchase(args: {
  customer: CustomerPayload;
  eventName: string;
  value: number;
  currency: string;
  paymentId: string;
  /** Optional category — sent as custom_data.kind when non-empty */
  kind?: string;
  clientIp: string;
  clientUserAgent: string;
  fbc?: string;
  fbp?: string;
}): Promise<void> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  console.log(
    `[capi] fire start event=${args.eventName} paymentId=${args.paymentId} value=${args.value} hasCreds=${Boolean(pixelId && accessToken)}`,
  );
  if (!pixelId || !accessToken) {
    console.warn(
      "[capi] META_PIXEL_ID or META_CAPI_ACCESS_TOKEN not set — skipping CAPI fire",
    );
    return;
  }

  const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${pixelId}/events?access_token=${accessToken}`;

  const hashedEmail = sha256Lower(args.customer.email);
  const hashedPhone = sha256Lower(
    normalizePhoneForCapi(args.customer.phone),
  );

  const userData: Record<string, unknown> = {
    email: [hashedEmail],
    phone: [hashedPhone],
  };
  if (args.fbc) userData.fbc = args.fbc;
  if (args.fbp) userData.fbp = args.fbp;
  if (args.clientUserAgent) userData.client_user_agent = args.clientUserAgent;
  if (args.clientIp) userData.client_ip_address = args.clientIp;

  const customData: Record<string, unknown> = {};
  if (args.currency) customData.currency = args.currency;
  if (args.value) customData.value = args.value;
  if (args.kind) customData.kind = args.kind;
  if (args.paymentId) customData.payment_id = args.paymentId;

  const event: Record<string, unknown> = {
    event_name: args.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: args.paymentId || randomUUID(),
    action_source: "website",
    user_data: userData,
  };
  if (Object.keys(customData).length > 0) event.custom_data = customData;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [event] }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "<no body>");
      console.warn(
        `[capi] Meta returned ${res.status} for payment ${args.paymentId}: ${text}`,
      );
    } else {
      console.log(
        `[capi] Meta CAPI OK ${res.status} for payment ${args.paymentId}`,
      );
    }
  } catch (err) {
    console.warn(
      `[capi] Meta CAPI fire failed for payment ${args.paymentId}:`,
      err instanceof Error ? err.message : err,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
