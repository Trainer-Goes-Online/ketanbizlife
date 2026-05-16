"use client";

import { useEffect, useState } from "react";
import { CTAButton } from "./CTAButton";
import styles from "./MobileCTABar.module.css";

interface Props {
  ctaText: string;
  ctaHref: string;
  /** Element id that, when scrolled past, reveals the bar (typically the hero) */
  revealAfterId: string;
}

export function MobileCTABar({ ctaText, ctaHref, revealAfterId }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById(revealAfterId);
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Show the bar when the hero has scrolled out of view
          setVisible(!entry.isIntersecting);
        }
      },
      { threshold: 0, rootMargin: "0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [revealAfterId]);

  return (
    <div
      className={`${styles.bar} ${visible ? styles.visible : ""}`}
      aria-hidden={!visible}
    >
      <CTAButton href={ctaHref} variant="primary" size="default" withArrow>
        {ctaText}
      </CTAButton>
    </div>
  );
}
