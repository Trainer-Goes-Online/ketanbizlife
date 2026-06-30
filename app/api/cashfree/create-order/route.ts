import { NextResponse } from "next/server";
import {
  createCashfreeOrder,
  getCashfreeMode,
  packBrowserContext,
  type CashfreeOrderTags,
} from "@/lib/cashfree";
import { clientConfig } from "@/client.config";
import { sha256Lower } from "@/lib/hash";
import { extractClientIp } from "@/lib/http";
import type {
  ApiErrorResponse,
  CreateOrderRequest,
  CreateOrderResponse,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPPORTED_CURRENCIES = new Set(["INR"]);

function computeServerGrandTotal(selectedBumpIds: string[]): number {
  const base = clientConfig.pricing.price;
  let bumps = 0;
  for (const id of selectedBumpIds) {
    const bump = clientConfig.checkout.bumps.find((b) => b.id === id);
    if (bump) bumps += bump.price;
  }
  return base + bumps;
}

export async function POST(
  request: Request,
): Promise<NextResponse<CreateOrderResponse | ApiErrorResponse>> {
  let body: CreateOrderRequest;
  try {
    body = (await request.json()) as CreateOrderRequest;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const {
    amount,
    currency,
    customer,
    selectedBumpIds,
    utm,
    fbc,
    fbp,
    fbclid,
    userAgent,
  } = body;
  // `eventSourceUrl` is intentionally not destructured: we no longer
  // store it in order_tags (see comment below for why). The browser
  // still sends the field, it just goes unread server-side.

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { success: false, error: "Invalid amount" },
      { status: 400 },
    );
  }

  if (typeof currency !== "string" || !SUPPORTED_CURRENCIES.has(currency)) {
    return NextResponse.json(
      { success: false, error: "Unsupported currency" },
      { status: 400 },
    );
  }

  if (
    !customer ||
    !customer.email ||
    !customer.phone ||
    !customer.firstName
  ) {
    return NextResponse.json(
      { success: false, error: "Missing customer details" },
      { status: 400 },
    );
  }

  // Defense in depth: recompute total from config + selected bump IDs and
  // refuse if the client tried to pass an amount different from the truth.
  const safeBumpIds = Array.isArray(selectedBumpIds) ? selectedBumpIds : [];
  const expected = computeServerGrandTotal(safeBumpIds);
  if (amount !== expected) {
    return NextResponse.json(
      {
        success: false,
        error: "Amount mismatch with selected bumps",
        code: "AMOUNT_MISMATCH",
      },
      { status: 400 },
    );
  }

  const customerId = sha256Lower(
    `${customer.email}|${customer.phone}`,
  ).slice(0, 32);
  const customerName =
    `${customer.firstName} ${customer.lastName}`.trim() || customer.firstName;

  const utmSafe = utm ?? {};
  // Snapshot the browser context so the Cashfree webhook can rebuild the
  // CAPI payload later. The webhook is hit by Cashfree's servers (no
  // browser headers), so without this snapshot CAPI would fire with blank
  // IP/UA and tank EMQ.
  //
  // Cashfree caps each order_tag value at 256 base64 chars and the whole
  // map at 10 keys. UA strings alone (140+ chars) already push the packed
  // JSON over the limit, so we split:
  //   - `ua`  : raw UA truncated to 180 chars, encoded ≤ 240
  //   - `ctx` : JSON of {fbc, fbp, ip} only
  // eventSourceUrl is dropped entirely; the webhook falls back to the
  // canonical /checkout URL on the brand domain (Meta is permissive about
  // event_source_url so long as it matches the configured pixel domain).
  // countryCode (`cc`) is dropped too — it's always "IN" here and the
  // webhook already defaults to "IN" when the tag is missing.
  const clientIp = extractClientIp(request);
  const ua = (userAgent ?? "").slice(0, 180);
  // fbc recovery for Meta in-app browsers. When the user clicks a Meta ad
  // and lands inside Instagram WebView / Facebook IAB, the Meta Pixel
  // frequently fails to write the `_fbc` cookie (IAB cookie sandboxing) so
  // the browser submits `fbc=""`. The URL still carries `?fbclid=…` though
  // (Meta sets that server-side before the browser even gets the page), and
  // UtmTracker persists it in sessionStorage. We rebuild fbc in the exact
  // format the pixel would have used: `fb.{subdomainIndex=1}.{ms_ts}.{fbclid}`.
  // Meta accepts and matches a server-constructed fbc identically to a
  // pixel-written one. Without this, we lose attribution for ~all paid
  // mobile-ad traffic.
  const resolvedFbc =
    (fbc && fbc.length > 0)
      ? fbc
      : (fbclid && fbclid.length > 0)
        ? `fb.1.${Date.now()}.${fbclid}`
        : "";
  const ctx = packBrowserContext({ fbc: resolvedFbc, fbp, ip: clientIp });
  // 9 tags total. One slot of headroom inside Cashfree's 10-key limit.
  // Adding any new tag requires dropping another or Cashfree returns 400.
  const orderTags: CashfreeOrderTags = {
    fn: customer.firstName,
    ln: customer.lastName,
    em: customer.email,
    ph: customer.phone,
    ci: customer.city,
    bumps: safeBumpIds.join(","),
    utm: JSON.stringify(utmSafe),
    ua: ua || undefined,
    ctx,
  };

  try {
    const order = await createCashfreeOrder({
      amount: expected,
      currency,
      customerId,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerName,
      orderTags,
    });

    return NextResponse.json({
      orderId: order.orderId,
      paymentSessionId: order.paymentSessionId,
      amount: expected,
      currency,
      mode: getCashfreeMode(),
    });
  } catch (err) {
    console.error("[create-order] Cashfree order creation failed", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create Cashfree order",
        code: "CASHFREE_ORDER_FAILED",
      },
      { status: 500 },
    );
  }
}
