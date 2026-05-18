import type { CustomerPayload, UtmPayload } from "./types";

export interface PabblyBumpItem {
  id: string;
  title: string;
  price: number;
}

/** Max number of flat bump_N_* slots emitted in the payload. */
const MAX_BUMP_SLOTS = 4;

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
  /** Structured selected bumps. Empty array when none selected. */
  bumpItems: PabblyBumpItem[];
  currency: string;
  timezone: string;
}): Promise<void> {
  const url = process.env.PABBLY_WEBHOOK_URL;
  console.log(
    `[pabbly] fire start orderId=${args.orderId} amount=${args.amount} bumpItems=${args.bumpItems.length} hasUrl=${Boolean(url)}`,
  );
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

  const bumpIds = args.bumpItems.map((b) => b.id).join(",");
  const bumpTitles = args.bumpItems.map((b) => b.title).join("|");
  const bumpPrices = args.bumpItems.map((b) => String(b.price)).join("|");
  const bumpsJson = JSON.stringify(args.bumpItems);

  const flatSlots: Record<string, string> = {};
  for (let i = 0; i < MAX_BUMP_SLOTS; i += 1) {
    const item = args.bumpItems[i];
    const slot = i + 1;
    flatSlots[`bump_${slot}_id`] = item?.id ?? "";
    flatSlots[`bump_${slot}_title`] = item?.title ?? "";
    flatSlots[`bump_${slot}_price`] = item ? String(item.price) : "";
  }

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
    bumps_count: String(args.bumpItems.length),
    bump_ids: bumpIds,
    bump_titles: bumpTitles,
    bump_prices: bumpPrices,
    bumps_json: bumpsJson,
    ...flatSlots,
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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "<no body>");
      console.warn(
        `[pabbly] webhook returned ${res.status} for order ${args.orderId}: ${text}`,
      );
    } else {
      console.log(
        `[pabbly] webhook OK ${res.status} for order ${args.orderId}`,
      );
    }
  } catch (err) {
    console.warn(
      `[pabbly] webhook failed for order ${args.orderId}:`,
      err instanceof Error ? err.message : err,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
