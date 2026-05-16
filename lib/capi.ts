import { randomUUID } from "node:crypto";
import { normalizePhoneForCapi, sha256Lower } from "./hash";
import type { CustomerPayload } from "./types";

const META_GRAPH_VERSION = "v19.0";

/**
 * Fire-and-forget POST to Meta Conversions API. Sends a Purchase event with
 * hashed user data per Meta's spec. Failures are logged but never surface.
 *
 * Spec ref: https://developers.facebook.com/docs/marketing-api/conversions-api
 */
export async function fireMetaCapiPurchase(args: {
  customer: CustomerPayload;
  eventName: string;
  value: number;
  currency: string;
  paymentId: string;
  eventSourceUrl: string;
  clientIp: string;
  clientUserAgent: string;
  fbc?: string;
  fbp?: string;
}): Promise<void> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn(
      "[capi] META_PIXEL_ID or META_CAPI_ACCESS_TOKEN not set — skipping CAPI fire",
    );
    return;
  }

  const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${pixelId}/events?access_token=${accessToken}`;

  const event = {
    event_name: args.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: args.paymentId || randomUUID(),
    event_source_url: args.eventSourceUrl,
    action_source: "website",
    user_data: {
      em: [sha256Lower(args.customer.email)],
      ph: [sha256Lower(normalizePhoneForCapi(args.customer.phone))],
      fn: [sha256Lower(args.customer.firstName)],
      ln: [sha256Lower(args.customer.lastName)],
      ct: [sha256Lower(args.customer.city)],
      country: [sha256Lower(args.customer.countryCode)],
      client_ip_address: args.clientIp,
      client_user_agent: args.clientUserAgent,
      ...(args.fbc ? { fbc: args.fbc } : {}),
      ...(args.fbp ? { fbp: args.fbp } : {}),
    },
    custom_data: {
      currency: args.currency,
      value: args.value,
    },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [event] }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "<no body>");
      console.warn(
        `[capi] Meta returned ${res.status} for payment ${args.paymentId}: ${text}`,
      );
    }
  } catch (err) {
    console.warn("[capi] Meta CAPI fire failed", err);
  }
}
