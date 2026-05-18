import type { UtmPayload } from "./types";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const satisfies readonly (keyof UtmPayload)[];

/**
 * Read UTM params from a URL search string. Returns an object with only the
 * UTM keys present in the search.
 */
export function readUtmFromSearch(search: string): UtmPayload {
  const params = new URLSearchParams(search);
  const out: UtmPayload = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) out[key] = value;
  }
  return out;
}

/**
 * Read UTM params from a plain object (e.g. Next.js searchParams in a server
 * component). Arrays (?utm_source=a&utm_source=b) take the first value.
 */
export function readUtmFromObject(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): UtmPayload {
  if (!searchParams) return {};
  const out: UtmPayload = {};
  for (const key of UTM_KEYS) {
    const raw = searchParams[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value) out[key] = value;
  }
  return out;
}

/**
 * Read UTM params from sessionStorage under the provided storage key.
 * Returns empty object if unset or invalid.
 */
export function readUtmFromStorage(storageKey: string): UtmPayload {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") {
      return parsed as UtmPayload;
    }
    return {};
  } catch {
    return {};
  }
}

/**
 * Persist UTM params to sessionStorage. Only overwrites if the incoming
 * payload has at least one defined value (so cold visits don't wipe earlier UTMs).
 */
export function persistUtm(storageKey: string, utm: UtmPayload): void {
  if (typeof window === "undefined") return;
  const hasAny = Object.values(utm).some((v) => v && v.length > 0);
  if (!hasAny) return;
  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(utm));
  } catch {
    // sessionStorage may be unavailable (private mode, quota); fail silently
  }
}

/**
 * Encode UTM payload as a query string fragment ("&utm_source=x&utm_medium=y").
 * Includes only defined keys. Returns "" if empty.
 */
export function utmToQueryString(utm: UtmPayload): string {
  const params = new URLSearchParams();
  for (const key of UTM_KEYS) {
    const v = utm[key];
    if (v) params.set(key, v);
  }
  const s = params.toString();
  return s ? `&${s}` : "";
}

/**
 * Read a cookie by name (for fbc / fbp lookup on the client).
 */
export function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : undefined;
}
