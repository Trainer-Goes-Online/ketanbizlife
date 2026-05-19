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

/**
 * Normalize city for Meta CAPI hashing per Meta's spec:
 * trim, lowercase, strip everything that isn't a-z (no spaces, no
 * punctuation, no digits). Example: "New Delhi" -> "newdelhi".
 */
export function normalizeCityForCapi(city: string): string {
  return city.trim().toLowerCase().replace(/[^a-z]/g, "");
}

/**
 * Normalize country for Meta CAPI hashing: 2-letter ISO 3166-1 alpha-2,
 * lowercased. Slices to 2 chars to defensively handle "IND" or other
 * accidental 3-letter inputs. Example: "IN" -> "in".
 */
export function normalizeCountryForCapi(country: string): string {
  return country.trim().toLowerCase().slice(0, 2);
}
