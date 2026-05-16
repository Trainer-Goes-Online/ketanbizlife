import { createHash } from "node:crypto";

/**
 * SHA-256 hash a string (lowercase, trimmed) for Meta CAPI user data.
 * Meta requires hashed email, phone, and other PII per their spec.
 * Returns lowercase hex string.
 */
export function sha256Lower(input: string): string {
  return createHash("sha256")
    .update(input.trim().toLowerCase())
    .digest("hex");
}

/**
 * Normalize phone for Meta CAPI hashing: keep digits only, prefixed with
 * country code (no "+"). Example: "+91 98765 43210" -> "919876543210".
 */
export function normalizePhoneForCapi(phone: string): string {
  return phone.replace(/\D+/g, "");
}
