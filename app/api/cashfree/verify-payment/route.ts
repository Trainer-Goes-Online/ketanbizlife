import { NextResponse } from "next/server";
import {
  getCashfreeMode,
  getCashfreeOrderPayments,
  getCashfreeOrderStatus,
} from "@/lib/cashfree";
import { firePabblyWebhook, type PabblyBumpItem } from "@/lib/pabbly";
import { fireMetaCapiPurchase } from "@/lib/capi";
import { tryClaimOrder } from "@/lib/dedup";
import { isProductionHost } from "@/lib/env";
import { clientConfig } from "@/client.config";
import type {
  ApiErrorResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "";
}

/**
 * Cashfree's payment lifecycle has two state machines that update at
 * different speeds:
 *   payment.payment_status: PENDING → SUCCESS         (1–2s after pay)
 *   order.order_status:     ACTIVE  → PAID            (2–5s after pay)
 *
 * Cashfree's modal closes as soon as `payment_status` flips. The browser
 * then immediately calls verify-payment. If we only check `order_status`
 * we get a false negative for 2-5 seconds. The fix: query BOTH endpoints
 * in parallel each attempt, accept either signal as "paid", and retry
 * with a 1s backoff up to 5 attempts (max ~5s wall time, well under
 * Vercel's 5m function limit).
 */
const POLL_MAX_ATTEMPTS = 5;
const POLL_DELAY_MS = 1000;

async function pollForPaidStatus(orderId: string): Promise<{
  isPaid: boolean;
  orderStatus: string;
  paymentId?: string;
  attempts: number;
}> {
  let lastOrderStatus = "UNKNOWN";

  for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
    const attempts = i + 1;
    let orderStatus: string | null = null;
    let payments: Awaited<
      ReturnType<typeof getCashfreeOrderPayments>
    > = [];

    try {
      const [orderRes, paymentsRes] = await Promise.all([
        getCashfreeOrderStatus(orderId),
        getCashfreeOrderPayments(orderId),
      ]);
      orderStatus = orderRes.orderStatus;
      payments = paymentsRes;
      lastOrderStatus = orderStatus;
    } catch (err) {
      console.warn(
        `[verify-payment] poll attempt ${attempts} for ${orderId} failed:`,
        err instanceof Error ? err.message : err,
      );
      // Will retry next iteration; orderStatus stays "UNKNOWN"
    }

    const successPayment = payments.find(
      (p) => p.payment_status === "SUCCESS",
    );
    if (orderStatus === "PAID" || successPayment) {
      return {
        isPaid: true,
        orderStatus: orderStatus ?? lastOrderStatus,
        paymentId: successPayment?.cf_payment_id,
        attempts,
      };
    }

    if (i < POLL_MAX_ATTEMPTS - 1) {
      await new Promise((resolve) => setTimeout(resolve, POLL_DELAY_MS));
    }
  }

  return {
    isPaid: false,
    orderStatus: lastOrderStatus,
    attempts: POLL_MAX_ATTEMPTS,
  };
}

function resolveBumps(selectedBumpIds: string[]): {
  bumpsLine: string;
  bumpsTotal: number;
  bumpItems: PabblyBumpItem[];
} {
  const matched = selectedBumpIds
    .map((id) => clientConfig.checkout.bumps.find((b) => b.id === id))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  const bumpsLine =
    matched.length > 0
      ? matched.map((b) => `${b.title} (₹${b.price})`).join("; ")
      : "none";
  const bumpsTotal = matched.reduce((sum, b) => sum + b.price, 0);
  const bumpItems: PabblyBumpItem[] = matched.map((b) => ({
    id: b.id,
    title: b.title,
    price: b.price,
  }));
  return { bumpsLine, bumpsTotal, bumpItems };
}

export async function POST(
  request: Request,
): Promise<NextResponse<VerifyPaymentResponse | ApiErrorResponse>> {
  let body: VerifyPaymentRequest;
  try {
    body = (await request.json()) as VerifyPaymentRequest;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const {
    orderId,
    customer,
    utm,
    fbc,
    fbp,
    selectedBumpIds,
    grandTotal,
    eventSourceUrl,
  } = body;

  if (
    !orderId ||
    !customer ||
    !customer.email ||
    !customer.phone ||
    typeof grandTotal !== "number"
  ) {
    return NextResponse.json(
      { success: false, error: "Missing required fields" },
      { status: 400 },
    );
  }

  // ---- Poll Cashfree until paid (handles the order/payment status race) ----
  const paid = await pollForPaidStatus(orderId);
  console.log(
    `[verify-payment] orderId=${orderId} attempts=${paid.attempts} isPaid=${paid.isPaid} finalOrderStatus=${paid.orderStatus} paymentId=${paid.paymentId ?? "<none>"}`,
  );

  if (!paid.isPaid) {
    // Distinguish "Cashfree said not PAID" (400 — user/payment problem)
    // from "couldn't reach Cashfree across all retries" (502 — infra problem).
    if (paid.orderStatus === "UNKNOWN") {
      return NextResponse.json(
        { success: false, error: "Could not verify payment with Cashfree" },
        { status: 502 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "Payment not completed",
        code: `ORDER_STATUS_${paid.orderStatus}`,
      },
      { status: 400 },
    );
  }

  // cf_payment_id is what we pass downstream as the canonical payment ID
  // (used as Meta event_id for dedup and as payment_id in Pabbly).
  // Falls back to orderId when /payments hasn't surfaced the cf_payment_id
  // yet but order_status is already PAID — rare but possible.
  const paymentId = paid.paymentId ?? orderId;

  // ---- Fire downstream integrations ----
  // Architecture note: verify-payment is the SOLE source of Meta CAPI
  // events. The Cashfree webhook fires Pabbly only — it doesn't carry
  // the browser context (IP, UA, fbc, fbp) Meta needs for high EMQ.
  // Pabbly is fired by whichever path (verify-payment or webhook) wins
  // the orderId claim; CAPI fires unconditionally here because it
  // depends on this request's headers/body for full server-context.
  const safeBumpIds = Array.isArray(selectedBumpIds) ? selectedBumpIds : [];
  const { bumpsLine, bumpsTotal, bumpItems } = resolveBumps(safeBumpIds);
  const basePrice = clientConfig.pricing.price;
  // Trust the server-side resolved total over anything from the client.
  const serverGrandTotal = basePrice + bumpsTotal;

  const clientIp = extractClientIp(request);
  const clientUserAgent = request.headers.get("user-agent") ?? "";

  // Pabbly dedup: webhook may have fired Pabbly already (cross-Lambda
  // collisions still possible — Meta's event_id dedup handles CAPI).
  const isFirstClaim = tryClaimOrder(orderId);
  const pabblyPromise = isFirstClaim
    ? firePabblyWebhook({
        customer,
        utm: utm ?? {},
        paymentId,
        orderId,
        amount: serverGrandTotal,
        basePrice,
        bumpsTotal,
        bumps: bumpsLine,
        bumpItems,
        currency: clientConfig.pricing.currency,
        timezone: clientConfig.event.timezone,
      })
    : Promise.resolve();

  // CAPI fires only for REAL conversions: production domain + production
  // Cashfree mode + amount > ₹1 (skip test charges). Any single condition
  // missing blocks the fire so Meta never sees sandbox / test traffic.
  const cashfreeMode = getCashfreeMode();
  const onProductionDomain = isProductionHost(request);
  const isRealCharge = serverGrandTotal > 1;
  const capiAllowed =
    clientConfig.capi.enabled &&
    onProductionDomain &&
    cashfreeMode === "production" &&
    isRealCharge;
  if (clientConfig.capi.enabled && !capiAllowed) {
    console.log(
      `[verify-payment] CAPI skipped — host=${request.headers.get("host")} (prod=${onProductionDomain}) mode=${cashfreeMode} amount=${serverGrandTotal}`,
    );
  }
  // event_source_url comes from the client (window.location.href in
  // CheckoutForm). Fall back to the production checkout URL when the
  // client didn't send it — required by Meta CAPI for matching +
  // restricted-category compliance.
  const resolvedEventSourceUrl =
    eventSourceUrl ||
    `https://${clientConfig.brand.domain}/checkout`;

  const capiPromise = capiAllowed
    ? fireMetaCapiPurchase({
        customer,
        eventName: clientConfig.capi.eventName,
        value: serverGrandTotal,
        currency: clientConfig.pricing.currency,
        paymentId,
        eventSourceUrl: resolvedEventSourceUrl,
        kind: clientConfig.capi.kind,
        clientIp,
        clientUserAgent,
        fbc,
        fbp,
      })
    : Promise.resolve();

  // Critical: on Vercel serverless, fire-and-forget promises are killed when
  // the function returns. We MUST await before responding so the network
  // round-trips actually complete. Both fires are internally try/catch'd and
  // have 5s AbortController timeouts, so neither can hang verify-payment
  // longer than the Vercel function limit.
  await Promise.all([pabblyPromise, capiPromise]);

  return NextResponse.json({ success: true, paymentId });
}
