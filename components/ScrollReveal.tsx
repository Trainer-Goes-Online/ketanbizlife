"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type From = "up" | "down" | "left" | "right";

interface Props {
  children: ReactNode;
  delay?: number;
  distance?: number;
  duration?: number;
  from?: From;
  once?: boolean;
  className?: string;
  as?: "div" | "section" | "article" | "ul" | "ol" | "header" | "footer";
}

/**
 * Wraps children with a directional reveal triggered when the element enters
 * the viewport. Respects prefers-reduced-motion. Uses transform + opacity only.
 */
export function ScrollReveal({
  children,
  delay = 0,
  distance = 24,
  duration = 0.7,
  from = "up",
  once = true,
  className,
  as = "div",
}: Props) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const initial =
    from === "up"
      ? { opacity: 0, y: distance }
      : from === "down"
        ? { opacity: 0, y: -distance }
        : from === "left"
          ? { opacity: 0, x: -distance }
          : { opacity: 0, x: distance };

  const target =
    from === "up" || from === "down"
      ? { opacity: 1, y: 0 }
      : { opacity: 1, x: 0 };

  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial={initial}
      whileInView={target}
      viewport={{ once, margin: "-8% 0px -8% 0px" }}
      transition={{
        duration,
        delay,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      {children}
    </MotionTag>
  );
}
