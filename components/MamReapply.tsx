"use client";

import { useEffect } from "react";
import { reapplyMamFromCookie } from "@/lib/analytics";

/**
 * Backup safety net for the kbl_mam cookie pattern. Re-fires the Meta
 * Pixel init with the persisted hashed identity on mount.
 *
 * Used on /thank-you to harden against the race where the inline pixel
 * script in app/layout.tsx ran BEFORE the cookie was written (e.g. the
 * very first MAM call on the /checkout form-fill path didn't complete
 * before the redirect). fbq('init') is idempotent, so calling it again
 * with the same hashed matching is a no-op for Meta.
 *
 * Mounted from a server-rendered page (e.g. app/thank-you/page.tsx)
 * via this thin client wrapper so the outer page can keep static
 * prerender + a `metadata` export.
 */
export function MamReapply() {
  useEffect(() => {
    reapplyMamFromCookie();
  }, []);
  return null;
}
