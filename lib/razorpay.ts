import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "node:crypto";

let cachedInstance: Razorpay | null = null;

/**
 * Lazily initialize the Razorpay SDK with credentials from env. Throws clearly
 * if credentials are missing (caller should map this to a 500 response).
 */
export function getRazorpay(): Razorpay {
  if (cachedInstance) return cachedInstance;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay credentials missing — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local",
    );
  }

  cachedInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return cachedInstance;
}

/**
 * Verify Razorpay's HMAC-SHA256 signature for a payment success callback.
 * Razorpay signs the literal string "${orderId}|${paymentId}" with the key secret.
 * Uses timing-safe comparison to defeat side-channel attacks.
 */
export function verifyRazorpaySignature(args: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;

  const expected = createHmac("sha256", keySecret)
    .update(`${args.orderId}|${args.paymentId}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const providedBuf = Buffer.from(args.signature, "hex");

  if (expectedBuf.length !== providedBuf.length) return false;
  return timingSafeEqual(expectedBuf, providedBuf);
}
