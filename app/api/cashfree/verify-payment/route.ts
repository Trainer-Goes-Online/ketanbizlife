import { NextResponse } from "next/server";
import {
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

  const { orderId, customer, utm, fbc, fbp, selectedBumpIds, grandTotal } =
    body;

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

  // ---- Status check (the security gate) ----
  let orderStatus: string;
  try {
    const status = await getCashfreeOrderStatus(orderId);
    orderStatus = status.orderStatus;
  } catch (err) {
    console.error("[verify-payment] getCashfreeOrderStatus failed", err);
    return NextResponse.json(
      { success: false, error: "Could not verify payment with Cashfree" },
      { status: 502 },
    );
  }

  if (orderStatus !== "PAID") {
    return NextResponse.json(
      {
        success: false,
        error: "Payment not completed",
        code: `ORDER_STATUS_${orderStatus}`,
      },
      { status: 400 },
    );
  }

  // ---- Pull the cf_payment_id for the successful payment ----
  let paymentId = "";
  try {
    const payments = await getCashfreeOrderPayments(orderId);
    const success = payments.find((p) => p.payment_status === "SUCCESS");
    paymentId = success?.cf_payment_id ?? "";
  } catch (err) {
    console.warn(
      "[verify-payment] getCashfreeOrderPayments failed — falling back to orderId",
      err,
    );
  }
  if (!paymentId) paymentId = orderId;

  // ---- Dedup: if webhook already fired downstream for this order, no-op ----
  if (!tryClaimOrder(orderId)) {
    return NextResponse.json({ success: true, paymentId });
  }

  // ---- Fire downstream non-blocking integrations ----
  const safeBumpIds = Array.isArray(selectedBumpIds) ? selectedBumpIds : [];
  const { bumpsLine, bumpsTotal, bumpItems } = resolveBumps(safeBumpIds);
  const basePrice = clientConfig.pricing.price;
  // Trust the server-side resolved total over anything from the client.
  const serverGrandTotal = basePrice + bumpsTotal;

  const clientIp = extractClientIp(request);
  const clientUserAgent = request.headers.get("user-agent") ?? "";

  const pabblyPromise = firePabblyWebhook({
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
  });

  const capiAllowed = clientConfig.capi.enabled && isProductionHost(request);
  if (clientConfig.capi.enabled && !capiAllowed) {
    console.log(
      `[verify-payment] CAPI skipped — host=${request.headers.get("host")} != ${clientConfig.brand.domain}`,
    );
  }
  const capiPromise = capiAllowed
    ? fireMetaCapiPurchase({
        customer,
        eventName: clientConfig.capi.eventName,
        value: serverGrandTotal,
        currency: clientConfig.pricing.currency,
        paymentId,
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
