import { createHmac, timingSafeEqual } from "node:crypto";
import type { CashfreeMode } from "./types";

const SANDBOX_BASE = "https://sandbox.cashfree.com";
const PRODUCTION_BASE = "https://api.cashfree.com";
const API_VERSION = "2023-08-01";

interface CashfreeConfig {
  clientId: string;
  clientSecret: string;
  mode: CashfreeMode;
  baseUrl: string;
  headers: Record<string, string>;
}

export function getCashfreeMode(): CashfreeMode {
  const raw = (process.env.CASHFREE_API_MODE ?? "sandbox").trim().toLowerCase();
  return raw === "production" ? "production" : "sandbox";
}

export function getCashfreeConfig(): CashfreeConfig {
  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Cashfree credentials missing — set CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET in .env.local",
    );
  }

  const mode = getCashfreeMode();
  const baseUrl = mode === "production" ? PRODUCTION_BASE : SANDBOX_BASE;

  return {
    clientId,
    clientSecret,
    mode,
    baseUrl,
    headers: {
      "x-api-version": API_VERSION,
      "x-client-id": clientId,
      "x-client-secret": clientSecret,
      "Content-Type": "application/json",
    },
  };
}

export interface CashfreeOrderTags {
  fn?: string;
  ln?: string;
  em?: string;
  ph?: string;
  ci?: string;
  cc?: string;
  bumps?: string;
  utm?: string;
  fbc?: string;
  fbp?: string;
  base?: string;
  grand?: string;
}

export interface CreateCashfreeOrderArgs {
  amount: number;
  currency: string;
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  notes?: Record<string, string>;
  orderTags?: CashfreeOrderTags;
  returnUrl?: string;
  notifyUrl?: string;
}

interface CashfreeCreateOrderResponse {
  cf_order_id?: number | string;
  order_id: string;
  payment_session_id: string;
  order_status?: string;
}

/**
 * Cashfree restricts order_tag values to the regex
 * `^[a-zA-Z0-9-_\.@:/\,]+$` and rejects the whole order otherwise. To carry
 * arbitrary user data (emails with `+`, names with spaces, UTM JSON with `{}`,
 * etc.) through Cashfree's webhook safety-net, we base64url-encode each value.
 * The webhook handler decodes them on the way out.
 *
 * Base64url alphabet (A–Z, a–z, 0–9, `-`, `_`) is a subset of what Cashfree
 * accepts, so the encoded form always validates.
 */
function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function base64UrlDecode(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(padded, "base64").toString("utf-8");
}

function sanitizeTags(
  tags: CashfreeOrderTags | undefined,
): Record<string, string> | undefined {
  if (!tags) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(tags)) {
    if (v === undefined || v === null || v === "") continue;
    const encoded = base64UrlEncode(String(v));
    if (encoded.length > 256) continue; // safety net; values are short
    out[k] = encoded;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export async function createCashfreeOrder(
  args: CreateCashfreeOrderArgs,
): Promise<{ orderId: string; paymentSessionId: string }> {
  const cfg = getCashfreeConfig();

  const body: Record<string, unknown> = {
    order_amount: args.amount,
    order_currency: args.currency,
    customer_details: {
      customer_id: args.customerId,
      customer_email: args.customerEmail,
      customer_phone: args.customerPhone,
      customer_name: args.customerName,
    },
  };

  // Only include order_meta when there's at least one field to put in it.
  // Cashfree rejects an empty order_meta object with a generic 400.
  const orderMeta: Record<string, string> = {};
  if (args.returnUrl) orderMeta.return_url = args.returnUrl;
  if (args.notifyUrl) orderMeta.notify_url = args.notifyUrl;
  if (Object.keys(orderMeta).length > 0) body.order_meta = orderMeta;

  const tags = sanitizeTags(args.orderTags);
  if (tags) body.order_tags = tags;
  if (args.notes) body.order_note = JSON.stringify(args.notes).slice(0, 250);

  const res = await fetch(`${cfg.baseUrl}/pg/orders`, {
    method: "POST",
    headers: cfg.headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "<no body>");
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "[cashfree] create-order request body:",
        JSON.stringify(body),
      );
    }
    throw new Error(`Cashfree create-order ${res.status}: ${text}`);
  }

  const data = (await res.json()) as CashfreeCreateOrderResponse;
  if (!data.order_id || !data.payment_session_id) {
    throw new Error(
      `Cashfree create-order missing order_id or payment_session_id: ${JSON.stringify(data)}`,
    );
  }

  return {
    orderId: data.order_id,
    paymentSessionId: data.payment_session_id,
  };
}

export interface CashfreeOrderStatus {
  orderStatus: string;
  orderAmount: number;
  orderTags?: Record<string, string>;
  customerDetails?: {
    customer_email?: string;
    customer_phone?: string;
    customer_name?: string;
  };
}

export async function getCashfreeOrderStatus(
  orderId: string,
): Promise<CashfreeOrderStatus> {
  const cfg = getCashfreeConfig();

  const res = await fetch(
    `${cfg.baseUrl}/pg/orders/${encodeURIComponent(orderId)}`,
    {
      method: "GET",
      headers: cfg.headers,
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "<no body>");
    throw new Error(`Cashfree get-order ${res.status}: ${text}`);
  }

  const data = (await res.json()) as {
    order_status?: string;
    order_amount?: number;
    order_tags?: Record<string, string>;
    customer_details?: {
      customer_email?: string;
      customer_phone?: string;
      customer_name?: string;
    };
  };

  return {
    orderStatus: data.order_status ?? "UNKNOWN",
    orderAmount: typeof data.order_amount === "number" ? data.order_amount : 0,
    orderTags: data.order_tags,
    customerDetails: data.customer_details,
  };
}

export interface CashfreePaymentEntry {
  cf_payment_id: string;
  payment_status: string;
  payment_amount: number;
  payment_method?: unknown;
  payment_time?: string;
}

export async function getCashfreeOrderPayments(
  orderId: string,
): Promise<CashfreePaymentEntry[]> {
  const cfg = getCashfreeConfig();

  const res = await fetch(
    `${cfg.baseUrl}/pg/orders/${encodeURIComponent(orderId)}/payments`,
    {
      method: "GET",
      headers: cfg.headers,
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "<no body>");
    throw new Error(`Cashfree get-order-payments ${res.status}: ${text}`);
  }

  const data = (await res.json()) as Array<{
    cf_payment_id?: string | number;
    payment_status?: string;
    payment_amount?: number;
    payment_method?: unknown;
    payment_time?: string;
  }>;

  return data.map((p) => ({
    cf_payment_id: String(p.cf_payment_id ?? ""),
    payment_status: p.payment_status ?? "UNKNOWN",
    payment_amount:
      typeof p.payment_amount === "number" ? p.payment_amount : 0,
    payment_method: p.payment_method,
    payment_time: p.payment_time,
  }));
}

/**
 * Verify a Cashfree webhook signature.
 *
 * Cashfree signs `timestamp + rawBody` with HMAC-SHA256 using your client
 * secret, then base64-encodes the result. The webhook delivers the signature
 * in the `x-webhook-signature` header and the timestamp in `x-webhook-timestamp`.
 *
 * Reference: https://www.cashfree.com/docs/payments/webhooks
 */
export function verifyCashfreeWebhookSignature(args: {
  rawBody: string;
  timestamp: string;
  signature: string;
}): boolean {
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
  if (!clientSecret) return false;
  if (!args.timestamp || !args.signature || !args.rawBody) return false;

  const expected = createHmac("sha256", clientSecret)
    .update(args.timestamp + args.rawBody)
    .digest("base64");

  const expectedBuf = Buffer.from(expected, "utf-8");
  const providedBuf = Buffer.from(args.signature, "utf-8");

  if (expectedBuf.length !== providedBuf.length) return false;
  return timingSafeEqual(expectedBuf, providedBuf);
}
