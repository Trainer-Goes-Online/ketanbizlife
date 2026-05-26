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
    userAgent,
    eventSourceUrl,
  } = body;

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
  // Snapshot the browser context (fbc, fbp, UA, IP, page URL) into a packed
  // JSON blob now so the Cashfree webhook can rebuild it later. The webhook
  // is hit by Cashfree's servers (no browser headers), so without this
  // snapshot CAPI would fire with blank IP/UA and tank EMQ. Capturing at
  // create-order time is mandatory because that's our last shot at the
  // real browser request.
  const clientIp = extractClientIp(request);
  const ctx = packBrowserContext({
    fbc,
    fbp,
    ua: userAgent,
    ip: clientIp,
    esrc: eventSourceUrl,
  });
  const orderTags: CashfreeOrderTags = {
    fn: customer.firstName,
    ln: customer.lastName,
    em: customer.email,
    ph: customer.phone,
    ci: customer.city,
    cc: customer.countryCode,
    bumps: safeBumpIds.join(","),
    utm: JSON.stringify(utmSafe),
    base: String(clientConfig.pricing.price),
    grand: String(expected),
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
