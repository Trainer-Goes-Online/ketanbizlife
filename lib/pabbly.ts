import type { CustomerPayload, UtmPayload } from "./types";

/**
 * Fire-and-forget POST to the Pabbly Connect webhook. Failures are logged but
 * never surfaced to the user — payment verification is the only thing that
 * gates the thank-you redirect.
 */
export async function firePabblyWebhook(args: {
  customer: CustomerPayload;
  utm: UtmPayload;
  paymentId: string;
  orderId: string;
  /** Grand total paid (base + bumps), in major units (e.g. 598 for ₹598) */
  amount: number;
  basePrice: number;
  bumpsTotal: number;
  /** Human-readable list of selected bumps, e.g. "Title A (₹199); Title B (₹199)" or "none" */
  bumps: string;
  currency: string;
  timezone: string;
}): Promise<void> {
  const url = process.env.PABBLY_WEBHOOK_URL;
  if (!url) {
    console.warn("[pabbly] PABBLY_WEBHOOK_URL not set — skipping webhook fire");
    return;
  }

  const now = new Date();
  const dateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: args.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: args.timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const fullName = [args.customer.firstName, args.customer.lastName]
    .filter(Boolean)
    .join(" ");

  const payload = {
    first_name: args.customer.firstName,
    last_name: args.customer.lastName,
    full_name: fullName,
    email: args.customer.email,
    phone: args.customer.phone,
    city: args.customer.city,
    country_code: args.customer.countryCode,
    payment_id: args.paymentId,
    order_id: args.orderId,
    amount: String(args.amount),
    base_price: String(args.basePrice),
    bumps_total: String(args.bumpsTotal),
    bumps: args.bumps,
    currency: args.currency,
    payment_date: dateFormatter.format(now),
    payment_time: timeFormatter.format(now),
    payment_timestamp: now.toISOString(),
    utm_source: args.utm.utm_source ?? "",
    utm_medium: args.utm.utm_medium ?? "",
    utm_campaign: args.utm.utm_campaign ?? "",
    utm_content: args.utm.utm_content ?? "",
    utm_term: args.utm.utm_term ?? "",
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.warn(
        `[pabbly] webhook returned ${res.status} — payload sent for order ${args.orderId}`,
      );
    }
  } catch (err) {
    console.warn("[pabbly] webhook failed", err);
  }
}
