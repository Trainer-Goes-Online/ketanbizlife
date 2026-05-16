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

export interface CreateOrderRequest {
  amount: number;
  currency: string;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface VerifyPaymentRequest {
  orderId: string;
  paymentId: string;
  signature: string;
  customer: CustomerPayload;
  utm: UtmPayload;
  /** Optional Facebook click-id and browser-id cookies (forwarded for CAPI) */
  fbc?: string;
  fbp?: string;
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
