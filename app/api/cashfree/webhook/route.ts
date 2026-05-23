import { NextResponse } from "next/server";
import {
  base64UrlDecode,
  verifyCashfreeWebhookSignature,
} from "@/lib/cashfree";
import { firePabblyWebhook, type PabblyBumpItem } from "@/lib/pabbly";
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

  // Dedup: verify-payment may already have fired for this order.
  if (!tryClaimOrder(orderId)) {
    return NextResponse.json({ received: true, acted: false, deduped: true });
  }

  const rawTags = parsed.data?.order?.order_tags ?? null;
  const tags = decodeTags(rawTags);
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

  // Webhook is Pabbly-only now. Meta CAPI is owned exclusively by the
  // verify-payment route because that's the one route called from the
  // user's browser — it has the full server-context (IP, UA, fbc, fbp)
  // we need for 9.5+ EMQ. Firing CAPI here would ship events with
  // those 4 fields blank, polluting Meta's match-quality scoring.
  // Rare edge case (user closes browser before verify-payment runs)
  // still gets fulfilled via this Pabbly fire — they lose Meta
  // attribution only, not the email/Zoom link/sheet row.
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
  });

  return NextResponse.json({ received: true, acted: true });
}
