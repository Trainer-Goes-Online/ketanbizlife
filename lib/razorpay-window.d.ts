/**
 * Razorpay checkout.js global — loaded via <Script> in layout.tsx with
 * strategy="lazyOnload". The SDK attaches a Razorpay constructor to window.
 */

export interface RazorpayPrefill {
  name?: string;
  email?: string;
  contact?: string;
}

export interface RazorpayNotes {
  [key: string]: string;
}

export interface RazorpayTheme {
  color?: string;
}

export interface RazorpaySuccessPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (payload: RazorpaySuccessPayload) => void;
  prefill?: RazorpayPrefill;
  notes?: RazorpayNotes;
  theme?: RazorpayTheme;
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    confirm_close?: boolean;
  };
}

export interface RazorpayConstructor {
  new (options: RazorpayOptions): {
    open(): void;
    on(event: string, handler: (...args: unknown[]) => void): void;
    close(): void;
  };
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

export {};
