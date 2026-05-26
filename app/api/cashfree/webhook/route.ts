import { NextResponse } from "next/server";
import {
  base64UrlDecode,
  getCashfreeMode,
  unpackBrowserContext,
  verifyCashfreeWebhookSignature,
} from "@/lib/cashfree";
import { firePabblyWebhook, type PabblyBumpItem } from "@/lib/pabbly";
import { fireMetaCapiPurchase } from "@/lib/capi";
import { tryClaimOrder } from "@/lib/dedup";
import { clientConfig } from "@/client.config";
import type { CustomerPayload, UtmPayload } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CashfreeWebhookPayload {
  type?: string;
  data?: {
    order?: {
      order_id?: string;
      order_amount?: number;
      order_currency?: string;
      order_tags?: Record<string, string> | null;
    };
    payment?: {
      cf_payment_id?: string | number;
      payment_status?: string;
      payment_amount?: number;
      payment_currency?: string;
    };
    customer_details?: {
      customer_email?: string;
      customer_phone?: string;
      customer_name?: string;
    };
  };
}

/**
 * Order tags were base64url-encoded when the order was created (see
 * lib/cashfree.ts sanitizeTags). Decode each value here before use.
 */
function decodeTags(
  tags: Record<string, string> | null | undefined,
): Record<string, string> {
  if (!tags) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(tags)) {
    try {
      out[k] = base64UrlDecode(v);
    } catch {
      out[k] = v;
    }
  }
  return out;
}

function rebuildCustomerFromTags(
  tags: Record<string, string>,
  fallback: { email?: string; phone?: string; name?: string } | undefined,
): CustomerPayload | null {
  const email = tags.em || fallback?.email || "";
  const phone = tags.ph || fallback?.phone || "";
  if (!email || !phone) return null;

  const [fallbackFirst = "", ...fallbackRest] = (fallback?.name ?? "").split(
    " ",
  );
  return {
    firstName: tags.fn || fallbackFirst,
    lastName: tags.ln || fallbackRest.join(" "),
    email,
    phone,
    countryCode: tags.cc || "IN",
    city: tags.ci || "",
  };
}

function rebuildUtmFromTags(
  tags: Record<string, string>,
): UtmPayload {
  if (!tags.utm) return {};
  try {
    const parsed = JSON.parse(tags.utm) as UtmPayload;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function resolveBumps(idsCsv: string | undefined): {
  bumpsLine: string;
  bumpsTotal: number;
  bumpItems: PabblyBumpItem[];
} {
  const ids = (idsCsv ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const matched = ids
    .map((id) => clientConfig.checkout.bumps.find((b) => b.id === id))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  return {
    bumpsLine:
      matched.length > 0
        ? matched.map((b) => `${b.title} (₹${b.price})`).join("; ")
        : "none",
    bumpsTotal: matched.reduce((sum, b) => sum + b.price, 0),
    bumpItems: matched.map((b) => ({
      id: b.id,
      title: b.title,
      price: b.price,
    })),
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  // Cashfree signs the raw body — read it as text ONCE and don't reparse.
  const rawBody = await request.text();
  const timestamp = request.headers.get("x-webhook-timestamp") ?? "";
  const signature = request.headers.get("x-webhook-signature") ?? "";

  const valid = verifyCashfreeWebhookSignature({
    rawBody,
    timestamp,
    signature,
  });
  if (!valid) {
    console.warn("[cashfree-webhook] signature mismatch");
    return NextResponse.json(
      { success: false, error: "Invalid signature" },
      { status: 401 },
    );
  }

  let parsed: CashfreeWebhookPayload;
  try {
    parsed = JSON.parse(rawBody) as CashfreeWebhookPayload;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  // Only act on a successful payment event. For any other event (FAILED,
  // USER_DROPPED, etc) we just acknowledge so Cashfree doesn't retry.
  const eventType = parsed.type ?? "";
  const paymentStatus = parsed.data?.payment?.payment_status ?? "";
  const isSuccess =
    eventType === "PAYMENT_SUCCESS_WEBHOOK" || paymentStatus === "SUCCESS";
  if (!isSuccess) {
    return NextResponse.json({ received: true, acted: false });
  }

  const orderId = parsed.data?.order?.order_id ?? "";
  if (!orderId) {
    return NextResponse.json({ received: true, acted: false });
  }

  // Dedup: Cashfree can occasionally double-deliver the same webhook event
  // (retries on transient 5xx, network blips). Guard Pabbly so we don't
  // append a duplicate row. CAPI is intentionally not gated here because
  // Meta dedupes server-side on event_id (= cf_payment_id) within a 48h
  // window — and a same-Lambda double-claim is rare enough that we'd
  // rather pay the duplicate request cost than risk a missed fire.
  if (!tryClaimOrder(orderId)) {
    return NextResponse.json({ received: true, acted: false, deduped: true });
  }

  const rawTags = parsed.data?.order?.order_tags ?? null;
  const tags = decodeTags(rawTags);

  // Browser context was snapshotted at create-order time across TWO tags:
  //   - `ua`  : raw User-Agent (its own tag because UAs alone push past
  //              Cashfree's 256-char-per-value cap)
  //   - `ctx` : packed JSON of {fbc, fbp, ip}
  // eventSourceUrl is intentionally not stored — it falls back to the
  // canonical /checkout URL on the brand domain a few lines below.
  // Without these snapshots the webhook would fire CAPI with blank
  // IP/UA/fbc/fbp — exactly the EMQ-killing miss this whole rewrite
  // architects around.
  const ctx = unpackBrowserContext(tags.ctx);
  const userAgentSnapshot = tags.ua ?? "";

  const fallback = {
    email: parsed.data?.customer_details?.customer_email,
    phone: parsed.data?.customer_details?.customer_phone,
    name: parsed.data?.customer_details?.customer_name,
  };
  const customer = rebuildCustomerFromTags(tags, fallback);
  if (!customer) {
    console.warn(
      `[cashfree-webhook] missing customer for order ${orderId} — skipping fires`,
    );
    return NextResponse.json({ received: true, acted: false });
  }

  const utm = rebuildUtmFromTags(tags);
  const { bumpsLine, bumpsTotal, bumpItems } = resolveBumps(tags.bumps);
  const basePrice = clientConfig.pricing.price;
  const grandTotal =
    typeof parsed.data?.order?.order_amount === "number"
      ? parsed.data.order.order_amount
      : basePrice + bumpsTotal;

  const cfPaymentRaw = parsed.data?.payment?.cf_payment_id;
  const paymentId = cfPaymentRaw ? String(cfPaymentRaw) : orderId;
  const currency =
    parsed.data?.order?.order_currency ?? clientConfig.pricing.currency;

  // ---- CAPI gating ----
  // Critically, NO isProductionHost check here: this route is invoked by
  // Cashfree's servers, not by the brand domain. Host-based gating would
  // block every webhook-driven fire. Real-vs-test is gated by
  // CASHFREE_API_MODE instead — sandbox payments can't fire CAPI.
  const cashfreeMode = getCashfreeMode();
  const isRealCharge = grandTotal > 1;
  const capiAllowed =
    clientConfig.capi.enabled &&
    cashfreeMode === "production" &&
    isRealCharge;

  let capiAttempted = false;
  let capiOutcome: "ok" | "err" | "timeout" | "skipped" = "skipped";
  let capiSkipReason = "";

  if (!capiAllowed) {
    if (!clientConfig.capi.enabled) {
      capiSkipReason = "capi_disabled";
    } else if (cashfreeMode !== "production") {
      capiSkipReason = "not_production_mode";
    } else if (!isRealCharge) {
      capiSkipReason = "amount_below_threshold";
    }
    console.log(
      `[cashfree-webhook] CAPI skipped — order=${orderId} reason=${capiSkipReason} mode=${cashfreeMode} amount=${grandTotal}`,
    );
  } else {
    capiAttempted = true;
    // event_source_url is always the canonical checkout URL on the brand
    // domain. We don't snapshot the per-request URL (e.g. with UTM
    // params) because it would blow Cashfree's 256-char tag cap. Meta is
    // permissive about event_source_url as long as it matches a domain
    // registered against the pixel.
    capiOutcome = await fireMetaCapiPurchase({
      customer,
      eventName: clientConfig.capi.eventName,
      value: grandTotal,
      currency,
      paymentId,
      eventSourceUrl: `https://${clientConfig.brand.domain}/checkout`,
      kind: clientConfig.capi.kind,
      clientIp: ctx.ip ?? "",
      clientUserAgent: userAgentSnapshot,
      fbc: ctx.fbc,
      fbp: ctx.fbp,
    });
  }

  const cashfreeEventReceivedAt = new Date().toISOString();

  // Pabbly is the single source of truth for the Google Sheet now. The
  // capi_* diagnostic columns let us audit exactly why any given row's
  // Meta event did/didn't fire. Pabbly fire happens unconditionally
  // (provided we won the tryClaimOrder above) so the sheet stays complete
  // even when CAPI is gated off.
  await firePabblyWebhook({
    customer,
    utm,
    paymentId,
    orderId,
    amount: grandTotal,
    basePrice,
    bumpsTotal,
    bumps: bumpsLine,
    bumpItems,
    currency,
    timezone: clientConfig.event.timezone,
    source: "webhook",
    capiAttempted,
    capiOutcome,
    capiSkipReason,
    cashfreeEventReceivedAt,
  });

  // Always 200 to Cashfree. A non-200 here would trigger retries which,
  // post-tryClaimOrder cache TTL or across Lambdas, could duplicate the
  // Pabbly row. CAPI failures are already captured in the Pabbly row
  // (`capi_outcome`) and Vercel logs — we don't need to involve Cashfree.
  return NextResponse.json({ received: true, acted: true });
}
