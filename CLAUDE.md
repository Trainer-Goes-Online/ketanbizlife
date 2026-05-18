# Ketan BizLife — Landing Page (CLAUDE.md)

A high-conversion landing page funnel for **Ketan BizLife**, an Indian export-coaching brand. The product is a ₹99 live 3-hour Sunday Zoom webinar targeted at Indian manufacturers, traders, and sourcing agents who want to find real international buyers. Copy is Hinglish (Hindi + English), region is India, currency is INR.

## Client context

- **Brand**: Ketan BizLife (`export.ketanbizlife.in`). Founder runs two export brands (BizLife, IJARO) plus a financial advisory firm.
- **Offer**: ₹99 webinar (anchor ₹499) + optional ₹199 / ₹499-bundle checkout bumps + 5 included bonuses.
- **Funnel**: `/` redirects → `/export-buyers` (LP) → `/checkout` → Cashfree modal (overlay) → `/thank-you`.
- **Payments**: Cashfree (sandbox/production toggle via `CASHFREE_API_MODE`). Order data is forwarded to a Pabbly Connect webhook and to Meta CAPI (server-side `sales` event).
- **Critical rule**: All copy, prices, dates, and toggles live in [client.config.ts](client.config.ts). Components are pure presentation — never hardcode client strings in components.

## Tech stack

- **Framework**: Next.js 15 (App Router) + React 19, TypeScript strict mode, Turbopack dev server.
- **Styling**: CSS Modules per component (`*.module.css`) + global tokens in [app/globals.css](app/globals.css). No CSS-in-JS, no Tailwind.
- **Animation**: `motion` (Framer Motion v11). See [components/ScrollReveal.tsx](components/ScrollReveal.tsx) for the shared scroll-in primitive.
- **Fonts**: `next/font/google` — Fraunces (display), Inter (body), Noto Sans Devanagari (Hindi). Loaded in [app/layout.tsx](app/layout.tsx).
- **Payments**: Cashfree REST API (server-to-server) + `@cashfreepayments/cashfree-js` loader (injects sdk.cashfree.com v3 script on demand). Modal opens via `cashfree.checkout({ paymentSessionId, redirectTarget: "_modal" })`.
- **Phone validation**: `libphonenumber-js` in the checkout form.
- **Path alias**: `@/*` maps to repo root (see [tsconfig.json](tsconfig.json)).

## Routing & pages (App Router)

| Route | File | Purpose |
| --- | --- | --- |
| `/` | [app/page.tsx](app/page.tsx) | Server redirect to `clientConfig.funnel.slug` |
| `/export-buyers` | [app/export-buyers/page.tsx](app/export-buyers/page.tsx) | Main LP — composes all sections in order |
| `/checkout` | [app/checkout/page.tsx](app/checkout/page.tsx) | Two-column checkout (summary + form + bumps) |
| `/thank-you` | [app/thank-you/page.tsx](app/thank-you/page.tsx) | Post-purchase confirmation + calendar links |
| `/privacy` | [app/privacy/page.tsx](app/privacy/page.tsx) | Legal — shares [app/legal.module.css](app/legal.module.css) |
| `/terms` | [app/terms/page.tsx](app/terms/page.tsx) | Legal + `#refund` anchor |
| `POST /api/cashfree/create-order` | [app/api/cashfree/create-order/route.ts](app/api/cashfree/create-order/route.ts) | Creates Cashfree order; returns `payment_session_id` + mode for the client SDK. Stuffs customer/UTM/bumps into `order_tags` for webhook recovery. |
| `POST /api/cashfree/verify-payment` | [app/api/cashfree/verify-payment/route.ts](app/api/cashfree/verify-payment/route.ts) | Authoritative payment gate. Calls Cashfree's GET order/payments APIs → on `PAID` fires Pabbly + CAPI (deduped). |
| `POST /api/cashfree/webhook` | [app/api/cashfree/webhook/route.ts](app/api/cashfree/webhook/route.ts) | Cashfree-signed webhook safety net. HMAC-verifies, rebuilds customer/UTM from `order_tags`, fires Pabbly + CAPI if the verify-payment path didn't beat it. |

Root [app/layout.tsx](app/layout.tsx) injects fonts, metadata, and conditional GA4/Clarity scripts (only render when IDs are set). The Cashfree SDK is loaded on demand by `@cashfreepayments/cashfree-js` from inside the checkout page, not from the layout.

## Components ([components/](components/))

LP section components are consumed by [app/export-buyers/page.tsx](app/export-buyers/page.tsx) in this order:

`Hero` → `ScenesSection` → `WhoSection` → `AgendaSection` → `TransformationTable` → `IdentityBadgesGrid` → `BonusesSection` → `AboutSection` → `TestimonialsSection` → `GuaranteeSection` → `AntiPositioningSection` → `FaqSection` → `FinalCtaSection` → `Footer`.

Overlays: `MobileCTABar`, `FloatingCountdown` (both keyed off `revealAfterId="hero"`), `UtmTracker` (persists UTM params to sessionStorage).

Shared primitives:
- [components/CTAButton.tsx](components/CTAButton.tsx) / [SectionCTA.tsx](components/SectionCTA.tsx) — primary buttons.
- [components/Countdown.tsx](components/Countdown.tsx) — countdown driven by `clientConfig.event.countdownTargetISO`.
- [components/PriceBlock.tsx](components/PriceBlock.tsx), [MoneyBackBadge.tsx](components/MoneyBackBadge.tsx), [TrustLine.tsx](components/TrustLine.tsx).
- [components/ScrollReveal.tsx](components/ScrollReveal.tsx) — wraps content with motion in-view fade/slide.
- [components/Icon.tsx](components/Icon.tsx) — inline SVG sprite.
- Marquees: [CredentialsMarquee.tsx](components/CredentialsMarquee.tsx), [MastheadMarquee.tsx](components/MastheadMarquee.tsx).
- Illustrations: [ActIllustration.tsx](components/ActIllustration.tsx), [BonusIllustration.tsx](components/BonusIllustration.tsx), [AboutVisual.tsx](components/AboutVisual.tsx).
- Checkout: [CheckoutForm.tsx](components/CheckoutForm.tsx) (lives in `components/`, not `app/checkout/`).

Each `.tsx` component has a sibling `.module.css` — keep that pairing when adding new sections.

## Lib ([lib/](lib/))

- [lib/cashfree.ts](lib/cashfree.ts) — Cashfree REST client: `getCashfreeConfig`, `createCashfreeOrder`, `getCashfreeOrderStatus`, `getCashfreeOrderPayments`, `verifyCashfreeWebhookSignature` (HMAC-SHA256 over `timestamp + rawBody`).
- [lib/dedup.ts](lib/dedup.ts) — In-memory `tryClaimOrder(orderId)` so the verify route and webhook never double-fire Pabbly/CAPI. Best-effort across cold starts; CAPI's `event_id` dedup is the harder guarantee.
- [lib/pabbly.ts](lib/pabbly.ts) — POSTs verified-purchase payloads to the Pabbly Connect webhook. Payload now includes grand total, `base_price`, `bumps_total`, and a human-readable `bumps` line.
- [lib/capi.ts](lib/capi.ts) — Meta Conversions API server-side event (current event name: `sales`).
- [lib/hash.ts](lib/hash.ts) — SHA-256 hashing for CAPI user data + Cashfree `customer_id` derivation.
- [lib/utm.ts](lib/utm.ts) — UTM param parsing / sessionStorage persistence.
- [lib/types.ts](lib/types.ts) — shared API types (`CustomerPayload`, `CreateOrder*`, `VerifyPayment*`, `UtmPayload`, `CashfreeMode`).

## Config & environment

- [client.config.ts](client.config.ts) — **single source of truth for all copy/prices/dates/toggles**. Edit here to change anything on the site. Strongly typed via `ClientConfig`.
- [next.config.ts](next.config.ts) — `reactStrictMode`, AVIF/WebP, `optimizePackageImports: ["motion"]`, TS + ESLint build-blocking disabled (use `npm run typecheck` separately).
- [.env.local](.env.local) — single source of truth for environment variables (gitignored). Keys: Cashfree (`CASHFREE_CLIENT_ID`, `CASHFREE_CLIENT_SECRET`, `CASHFREE_API_MODE`), Pabbly (`PABBLY_WEBHOOK_URL`), Meta CAPI (`META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`), and all `NEXT_PUBLIC_WEBINAR_*` / `NEXT_PUBLIC_BUMP_*` price/date knobs that feed `clientConfig`.

## Scripts

- `npm run dev` — Next dev server with Turbopack (default; localhost:3000).
- `npm run dev:webpack` — fallback dev without Turbopack.
- `npm run build` / `npm start` — production build & serve.
- `npm run typecheck` — `tsc --noEmit` (TS errors don't block builds, so run this manually).
- `npm run lint` — `next lint`.

## Conventions

- **Never hardcode client copy in components.** Read from `clientConfig` props passed by the page.
- **One CSS Module per component**; class names are local. Global tokens (colors, radii, shadows) live in [app/globals.css](app/globals.css).
- **App Router only** — server components by default; mark `"use client"` only when you need state, effects, or browser APIs.
- **Strict TS** with `noUncheckedIndexedAccess` — guard array index access.
- **Env-driven prices/dates**: change `.env.local` (or Vercel envs) instead of editing config defaults for production rollouts.
- **`approvalItems` toggles** in `client.config.ts` gate claim copy (₹100 Cr volume, 9+ countries, refund line, competitor anti-positioning) — respect them when adding new claim-adjacent copy.
- **Meta CAPI fires only on the real brand domain** — gated by [lib/env.ts:isProductionHost](lib/env.ts) (request host must equal `clientConfig.brand.domain`). localhost and any Vercel URL skip CAPI entirely so test runs don't pollute pixel attribution. Pabbly fires unconditionally — point `PABBLY_WEBHOOK_URL` at a test workflow if you need to isolate that too.
