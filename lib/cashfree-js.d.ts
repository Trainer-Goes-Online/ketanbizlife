/**
 * Minimal type declarations for `@cashfreepayments/cashfree-js` (v3).
 * The package ships no .d.ts file. We only use `load`, so we type it
 * narrowly enough to support the modal flow in CheckoutForm.
 */
declare module "@cashfreepayments/cashfree-js" {
  export interface CashfreeCheckoutOptions {
    paymentSessionId: string;
    redirectTarget?: "_self" | "_blank" | "_top" | "_modal";
    returnUrl?: string;
  }

  export interface CashfreeCheckoutResult {
    error?: { message?: string; code?: string };
    redirect?: boolean;
    paymentDetails?: { paymentMessage?: string };
  }

  export interface Cashfree {
    checkout: (
      options: CashfreeCheckoutOptions,
    ) => Promise<CashfreeCheckoutResult>;
  }

  export interface LoadOptions {
    mode: "sandbox" | "production";
  }

  export function load(options: LoadOptions): Promise<Cashfree | null>;
}
