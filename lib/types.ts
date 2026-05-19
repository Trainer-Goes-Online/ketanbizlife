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
}

export type CashfreeMode = "sandbox" | "production";

export interface CreateOrderRequest {
  amount: number;
  currency: string;
  customer: CustomerPayload;
  /** IDs of selected checkout bumps (server resolves to titles/prices) */
  selectedBumpIds: string[];
  utm: UtmPayload;
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
