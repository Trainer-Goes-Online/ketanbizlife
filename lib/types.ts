/**
 * Shared types for API routes and client-side payment flow.
 */

export interface CustomerPayload {
  firstName: string;
  lastName: string;
  email: string;
  /** Full phone with country code prefix, e.g. "+919876543210" */
  phone: string;
  /** ISO 3166-1 alpha-2 country code, e.g. "IN" */
  countryCode: string;
  city: string;
}

export interface UtmPayload {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  /** Raw Facebook click ID from `?fbclid=…` on the landing URL. Persisted
   *  alongside UTMs so we can reconstruct `_fbc` server-side when the Meta
   *  Pixel fails to set the cookie (typical for in-app browser users). */
  fbclid?: string;
}

export type CashfreeMode = "sandbox" | "production";

export interface CreateOrderRequest {
  amount: number;
  currency: string;
  customer: CustomerPayload;
  /** IDs of selected checkout bumps (server resolves to titles/prices) */
  selectedBumpIds: string[];
  utm: UtmPayload;
  /** Facebook click-id cookie (snapshotted into order_tags for the webhook-side CAPI fire) */
  fbc?: string;
  /** Facebook browser-id cookie (snapshotted into order_tags for the webhook-side CAPI fire) */
  fbp?: string;
  /** Raw fbclid recovered from the landing URL via UTM persistence. Used by
   *  create-order to reconstruct `_fbc` when the Meta Pixel didn't set the
   *  cookie (the common case for Instagram/Facebook in-app browsers). */
  fbclid?: string;
  /** navigator.userAgent at submit time (snapshotted into order_tags for the webhook-side CAPI fire) */
  userAgent?: string;
  /** window.location.href at submit time (snapshotted into order_tags for the webhook-side CAPI fire) */
  eventSourceUrl?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  paymentSessionId: string;
  amount: number;
  currency: string;
  mode: CashfreeMode;
}

export interface VerifyPaymentRequest {
  orderId: string;
  customer: CustomerPayload;
  utm: UtmPayload;
  /** IDs of selected checkout bumps (server resolves to titles/prices) */
  selectedBumpIds: string[];
  grandTotal: number;
  /** Optional Facebook click-id and browser-id cookies (forwarded for CAPI) */
  fbc?: string;
  fbp?: string;
  /** window.location.href at the time of submit. Required by Meta CAPI as
   *  event_source_url for matching + restricted-category compliance. */
  eventSourceUrl?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  paymentId?: string;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
}
