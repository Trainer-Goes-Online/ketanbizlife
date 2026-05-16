"use client";

import { useEffect } from "react";
import { persistUtm, readUtmFromSearch } from "@/lib/utm";

interface Props {
  storageKey: string;
}

/**
 * Reads UTM params from window.location.search on first mount and persists to
 * sessionStorage under the configured key. Renders nothing.
 */
export function UtmTracker({ storageKey }: Props) {
  useEffect(() => {
    const utm = readUtmFromSearch(window.location.search);
    persistUtm(storageKey, utm);
  }, [storageKey]);

  return null;
}
