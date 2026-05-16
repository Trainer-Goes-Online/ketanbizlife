import { NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { firePabblyWebhook } from "@/lib/pabbly";
import { fireMetaCapiPurchase } from "@/lib/capi";
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

  const { orderId, paymentId, signature, customer, utm, fbc, fbp } = body;

  if (
    !orderId ||
    !paymentId ||
    !signature ||
    !customer ||
    !customer.email ||
    !customer.phone
  ) {
    return NextResponse.json(
      { success: false, error: "Missing required fields" },
      { status: 400 },
    );
  }

  // ---- Signature verification (the security gate) ----
  const valid = verifyRazorpaySignature({ orderId, paymentId, signature });
  if (!valid) {
    console.warn(`[verify-payment] Signature mismatch for order ${orderId}`);
    return NextResponse.json(
      { success: false, error: "Payment signature verification failed" },
      { status: 400 },
    );
  }

  // ---- Fire downstream non-blocking integrations ----
  // Either failure is logged but never surfaces to the user.
  const eventSourceUrl =
    request.headers.get("referer") ??
    `https://${clientConfig.brand.domain}/thank-you`;
  const clientIp = extractClientIp(request);
  const clientUserAgent = request.headers.get("user-agent") ?? "";

  const pabblyPromise = firePabblyWebhook({
    customer,
    utm: utm ?? {},
    paymentId,
    orderId,
    amount: clientConfig.pricing.pabblyAmountString,
    currency: clientConfig.pricing.currency,
    timezone: clientConfig.event.timezone,
  });

  const capiPromise = clientConfig.capi.enabled
    ? fireMetaCapiPurchase({
        customer,
        eventName: clientConfig.capi.eventName,
        value: clientConfig.capi.purchaseValue,
        currency: clientConfig.pricing.currency,
        paymentId,
        eventSourceUrl,
        clientIp,
        clientUserAgent,
        fbc,
        fbp,
      })
    : Promise.resolve();

  // Don't await — but kick them off. The success response goes back immediately.
  // We still need to start them; `void` here marks intent.
  void pabblyPromise;
  void capiPromise;

  return NextResponse.json({ success: true, paymentId });
}
