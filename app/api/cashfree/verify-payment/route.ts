import { NextResponse } from "next/server";
import {
  getCashfreeOrderPayments,
  getCashfreeOrderStatus,
} from "@/lib/cashfree";
import type {
  ApiErrorResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

/**
 * Authoritative payment-confirmation gate for the browser.
 *
 * Architecture note: this route is now ONLY a "is it paid yet?" probe.
 * Pabbly + Meta CAPI are owned exclusively by /api/cashfree/webhook because
 * mobile UPI Intent users almost never return to the browser after paying —
 * any side-effect tied to the browser fetch was missing ~75% of conversions.
 *
 * The Cashfree webhook is hit by Cashfree's servers regardless of what the
 * browser does, so it always fires. Browser context (IP/UA/fbc/fbp) is
 * snapshotted into Cashfree order_tags at create-order time so the webhook
 * can rebuild the full CAPI payload without needing this request's headers.
 */
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

  const { orderId, customer } = body;

  // We still require `customer` so we know this is a real submit and not
  // a probe / replay. We don't use the customer payload for any side-effect
  // here; the webhook reads identity from order_tags instead.
  if (
    !orderId ||
    !customer ||
    !customer.email ||
    !customer.phone
  ) {
    return NextResponse.json(
      { success: false, error: "Missing required fields" },
      { status: 400 },
    );
  }

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

  // cf_payment_id is what the browser uses as Meta event_id for the
  // browser-side Purchase pixel (paired with the server CAPI fire via
  // matching event_id). Falls back to orderId when /payments hasn't
  // surfaced the cf_payment_id yet but order_status is already PAID —
  // rare but possible.
  const paymentId = paid.paymentId ?? orderId;

  return NextResponse.json({ success: true, paymentId });
}
