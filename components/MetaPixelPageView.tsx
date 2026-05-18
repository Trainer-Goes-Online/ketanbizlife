"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    fbq?: (command: string, ...args: unknown[]) => void;
  }
}

interface Props {
  /** The brand's production domain. PageView only fires when window.location.host matches. */
  productionDomain: string;
}

/**
 * Fires fbq("track", "PageView") on initial mount and on every pathname
 * change. Renders nothing.
 *
 * Gated by `productionDomain` so localhost / *.vercel.app never send
 * PageViews to the real Pixel. The base pixel init script in layout.tsx
 * is gated the same way; this component just keeps tracking in sync with
 * client-side route navigations (Next App Router doesn't re-execute the
 * init script between Link clicks).
 */
export function MetaPixelPageView({ productionDomain }: Props) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const host = window.location.host.split(":")[0]?.toLowerCase() ?? "";
    if (host !== productionDomain.toLowerCase()) return;
    if (typeof window.fbq !== "function") return;
    window.fbq("track", "PageView");
  }, [pathname, productionDomain]);

  return null;
}
