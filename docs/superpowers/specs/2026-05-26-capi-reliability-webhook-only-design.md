# Webhook-only Meta CAPI + Pabbly architecture

**Date:** 2026-05-26
**Status:** Approved for implementation
**Owner:** Ketan BizLife landing page (`export.ketanbizlife.in`)

## Problem

Meta CAPI for the `sales` custom event under-reports by ~70-75%. Today: 4 paid purchases, 1 sales event in Events Manager. Yesterday: 8 paid, 4 reported. Pabbly fulfillment (Zoom email, Google Sheet row) fires for 100% of paid orders. Meta CAPI fires for only ~25%.

Because Meta campaigns are optimized on the `sales` custom event, every missed CAPI fire is a signal Meta's algorithm cannot use — leading to worse cost-per-result.

## Root cause (forensic-confirmed)

The current architecture has the browser-side `verify-payment` fetch as the sole source of CAPI fires. The Cashfree webhook fires Pabbly only.

Live test with mobile UPI Intent on 2026-05-26 confirmed:

1. User taps Pay on `/checkout`. Cashfree opens UPI Intent → GPay launches.
2. User completes payment in GPay (~10s).
3. Cashfree confirms payment server-side, fires webhook to our endpoint within ~2s. Pabbly row created.
4. User remains in GPay for 40-50s checking the success animation, switching to WhatsApp, etc.
5. **During this entire window, `verify-payment` does not fire.** No browser tab is in foreground, no JS runs.
6. Only when user manually returns to the Chrome tab does the Cashfree modal close and `verify-payment` finally dispatch.

For a non-trivial fraction of mobile UPI users, step 6 never happens. The tab is reaped by the OS, or the user simply considers the purchase done after seeing GPay's confirmation and never returns. CAPI is lost for those orders.

Razorpay implementations do not have this failure mode because Razorpay returns `payment_id` synchronously in a callback and requires no polling. Cashfree v3 modal requires the browser to be alive when the modal closes.

## Solution

Make the Cashfree webhook the **sole** source of both Pabbly and CAPI fires. The webhook is a server-to-server delivery from Cashfree's infrastructure and fires regardless of browser state.

The browser context (fbc, fbp, User-Agent, client IP, event source URL) that CAPI needs for high EMQ is snapshotted into Cashfree `order_tags` at create-order time. The webhook decodes the snapshot and fires CAPI with the same 11 user_data signals it has today (so EMQ stays at 9.3/10).

`verify-payment` becomes a pure status check — polls Cashfree to determine if `/thank-you` should render. No fires.

## Architecture

| Route | Responsibility |
| --- | --- |
| `create-order` | Creates Cashfree order; snapshots browser context (fbc, fbp, UA, IP, eventSourceUrl) into `order_tags.ctx` |
| `verify-payment` | Polls Cashfree; returns paid/not-paid to browser. **No Pabbly. No CAPI.** |
| `webhook` | Fires Pabbly + CAPI on PAYMENT_SUCCESS. CAPI fires with full 11 signals from `order_tags.ctx`. |
| `CheckoutForm` | Unchanged behavior. Browser Purchase pixel still fires on `/thank-you` and dedupes against server Purchase via `event_id = cf_payment_id`. |

## Failure-mode coverage

| Scenario | Before | After |
| --- | --- | --- |
| Mobile UPI user never returns to browser | Pabbly ✓, CAPI ✗ | Pabbly ✓, CAPI ✓ |
| User returns to browser quickly | Pabbly + CAPI from verify-payment ✓ | Pabbly + CAPI from webhook ✓ |
| Cashfree status APIs lag >5s | verify-payment returns 400, CAPI ✗ | Webhook fires from Cashfree server, no polling ✓ |
| iOS Safari force-quit during success modal | CAPI ✗ | Webhook fires CAPI ✓ |
| Browser tab killed by Android LMK | CAPI ✗ | Webhook fires CAPI ✓ |
| Cashfree double-delivers webhook (rare) | n/a | `tryClaimOrder` keeps Pabbly to 1 row; Meta dedupes CAPI on `event_id` |
| Our webhook endpoint returns 5xx | n/a | Cashfree retries up to 7× over hours |
| Catastrophic webhook failure (our endpoint down for hours) | n/a | Reconcile from Cashfree dashboard's PAID orders list; manual re-fire from Cashfree dashboard available |

## Component changes

### `lib/types.ts`
- `CreateOrderRequest` gains optional `fbc`, `fbp`, `userAgent`, `eventSourceUrl` fields.
- `VerifyPaymentRequest` unchanged.

### `lib/cashfree.ts`
- `CashfreeOrderTags`: remove `fbc`, `fbp` fields. Add `ctx?: string` to hold packed browser context.
- `sanitizeTags` per-value cap raised from 256 → 1024 chars (Cashfree's actual per-value limit).
- Add `packBrowserContext()` and `unpackBrowserContext()` helpers. Pack format: JSON string of `{fbc, fbp, ua, ip, esrc}` with empty-string keys filtered; `sanitizeTags` base64url-encodes before sending to Cashfree.

### `lib/capi.ts`
- `fireMetaCapiPurchase` return type changes from `Promise<void>` to `Promise<"ok" | "err" | "timeout" | "skipped">`.
- All existing logging preserved. The return value lets the webhook capture the outcome for the Pabbly diagnostic row.

### `lib/pabbly.ts`
- `firePabblyWebhook` args gain 5 diagnostic fields: `source`, `capiAttempted`, `capiOutcome`, `capiSkipReason`, `cashfreeEventReceivedAt`.
- Payload sent to Pabbly includes them as flat keys so they land as Google Sheet columns.

### `app/api/cashfree/create-order/route.ts`
- Read `fbc`, `fbp`, `userAgent`, `eventSourceUrl` from request body.
- Extract client IP from `x-forwarded-for` / `x-real-ip`.
- `packBrowserContext({fbc, fbp, ua: userAgent, ip: clientIp, esrc: eventSourceUrl})` → `orderTags.ctx`.

### `app/api/cashfree/webhook/route.ts`
- After signature verification, payload parsing, success check, and `tryClaimOrder` gate (existing):
  - `unpackBrowserContext(tags.ctx)` to reconstruct browser context.
  - Compute CAPI gate: `clientConfig.capi.enabled && cashfreeMode === "production" && grandTotal > 1`. **No host check** — webhook is hit by Cashfree's IPs, not the brand domain. `CASHFREE_API_MODE` is the production gate.
  - If gated out: record `capiSkipReason` (`capi_disabled` | `not_production_mode` | `amount_below_threshold`), `capiAttempted = false`, `capiOutcome = "skipped"`.
  - If allowed: fire CAPI with all 11 signals reconstructed from snapshot context. Capture return value as `capiOutcome`. Set `capiAttempted = true`.
- Fire Pabbly with diagnostic fields populated.
- Always return 200 to Cashfree (even if CAPI failed). Non-200 would trigger Cashfree retry, double-firing Pabbly.

### `app/api/cashfree/verify-payment/route.ts`
- Strip down to pure status check. Poll Cashfree, return `{success: true, paymentId}` or `{success: false, error}` to the browser.
- Removes: `firePabblyWebhook`, `fireMetaCapiPurchase`, `tryClaimOrder`, `isProductionHost` imports and all related logic.
- Drops from ~275 lines to ~80.

### `components/CheckoutForm.tsx`
- Create-order fetch body gains `fbc`, `fbp`, `userAgent: navigator.userAgent`, `eventSourceUrl: window.location.href`.
- Verify-payment fetch body sheds `fbc`, `fbp`, `eventSourceUrl` (not needed server-side anymore).
- `keepalive: true` on verify-payment fetch kept (still useful for /thank-you transition).
- Browser-side Purchase pixel + MAM fire on success unchanged.

### `lib/dedup.ts`
- Kept. Used by webhook for Pabbly dedup against rare Cashfree webhook double-delivery.

## Diagnostic visibility

For every paid order, the Pabbly Google Sheet row exposes:

- `source: "webhook"` — always "webhook" after this change. Future-proofs the schema if we add other sources.
- `capi_attempted: true | false` — whether we entered the CAPI fire path.
- `capi_outcome: "ok" | "err" | "timeout" | "skipped"` — the result.
- `capi_skip_reason: string` — explanation when `capi_attempted: false`. Empty when `capi_outcome: "ok"`.
- `cashfree_event_received_at: ISO 8601 timestamp` — when our webhook handler started processing.

When a CAPI miss is suspected: filter the sheet by orderId. The row tells you exactly what happened. No need to query Vercel logs (which only retain 1 hour).

## Out of scope (explicitly)

- No retry queue for failed CAPI fires. If Meta returns 5xx or times out, we log it. Manual re-fire tooling can be built later if this is ever observed in practice.
- No new infrastructure (Redis, KV, log drains). All diagnostic visibility lives in the existing Pabbly Google Sheet.
- No backfill of failed events from the last 24h. Today's losses are gone; the architectural fix prevents future losses.
- No automatic reconciliation cron. Manual cross-check between Cashfree dashboard PAID orders and Pabbly Sheet is acceptable as a weekly hygiene task.

## Migration notes

- **In-flight orders**: orders created before deploy but paid after deploy have no `order_tags.ctx`. Webhook CAPI fires for those with degraded EMQ (missing UA, IP-from-snapshot — Meta still accepts and matches on the remaining hashed PII). Window is limited to orders open in the deploy moment.
- **Browser cache**: users on `/checkout` at deploy time have the old `CheckoutForm` bundle that doesn't send `userAgent`/`eventSourceUrl`. Same degraded-EMQ outcome until they reload. ~5-minute window.
- **No data migration required.** Old order_tags missing `ctx` are handled gracefully by `unpackBrowserContext({})` → empty object → CAPI fires with whatever signals are available.

## Required manual step in Pabbly Connect

The Pabbly workflow's Google Sheets action step must be updated to map the 5 new fields to new columns in the existing fulfillment sheet:

- `source` → new column "Source"
- `capi_attempted` → new column "CAPI Attempted"
- `capi_outcome` → new column "CAPI Outcome"
- `capi_skip_reason` → new column "CAPI Skip Reason"
- `cashfree_event_received_at` → new column "Cashfree Event Received At"

Existing column mappings unchanged.

## Verification plan

After deploy:

1. **Single live test from mobile, simulating real user behavior:**
   - Make a ₹99 purchase via UPI Intent.
   - Stay in GPay for 60+ seconds after payment confirms.
   - **Do not return to the browser tab.** Close GPay → home screen.
2. **Within ~5 min, check the Pabbly Google Sheet.** A new row should appear with `source: "webhook"`, `capi_attempted: true`, `capi_outcome: "ok"`.
3. **Check Vercel logs:** webhook execution should show `[capi] Meta CAPI OK 200 for payment ...`. verify-payment may not appear at all (since browser never returned). That is the point.
4. **Within ~30-60 min, check Meta Events Manager Overview.** Both `Purchase` and `sales` counts increase by 1 for the test payment.
5. **Repeat with desktop + return-to-browser flow.** Confirm Pabbly Sheet shows the same row format. Browser Purchase pixel fires from `/thank-you` and dedupes against server Purchase at Meta via `event_id`.

## Success criteria

- Over a 24h window post-deploy: count of paid Cashfree orders == count of Pabbly Sheet rows == count of Meta server `sales` events.
- `capi_outcome: "ok"` rate is 100% for all rows where `capi_attempted: true`.
- Any `capi_outcome` other than `"ok"` is investigated immediately (the row's diagnostic fields point to the specific failure).
