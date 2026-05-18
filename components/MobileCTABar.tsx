"use client";

import { CTAButton } from "./CTAButton";
import styles from "./MobileCTABar.module.css";

interface Props {
  ctaText: string;
  ctaHref: string;
}

/**
 * Sticky bottom CTA bar shown on mobile/tablet from page load (including
 * over the hero). Hidden on desktop via CSS — the hero CTA is always
 * visible there, so a sticky bar would be redundant.
 */
export function MobileCTABar({ ctaText, ctaHref }: Props) {
  return (
    <div className={styles.bar}>
      <CTAButton href={ctaHref} variant="primary" size="default" withArrow>
        {ctaText}
      </CTAButton>
    </div>
  );
}
