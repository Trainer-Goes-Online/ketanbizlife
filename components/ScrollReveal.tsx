"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Delay before animation starts, in seconds */
  delay?: number;
  /** Vertical translate distance in pixels (default 24) */
  y?: number;
  /** Duration in seconds (default 0.6) */
  duration?: number;
  /** Stagger between direct children when wrapping a group (used by parent variants) */
  className?: string;
  as?: "div" | "section" | "article" | "ul" | "ol" | "header" | "footer";
}

/**
 * Wraps children with a fade-up reveal triggered when 10% of the element enters
 * the viewport. Respects prefers-reduced-motion (renders without animation).
 * Performance: animates transform + opacity only — never triggers layout.
 */
export function ScrollReveal({
  children,
  delay = 0,
  y = 24,
  duration = 0.6,
  className,
  as = "div",
}: Props) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </MotionTag>
  );
}
