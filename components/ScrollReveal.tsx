"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type From = "up" | "down" | "left" | "right";

interface Props {
  children: ReactNode;
  delay?: number;
  distance?: number;
  duration?: number;
  from?: From;
  once?: boolean;
  className?: string;
  as?: "div" | "section" | "article" | "ul" | "ol" | "li" | "header" | "footer";
}

/**
 * Wraps children with a directional reveal triggered when the element enters
 * the viewport. Respects prefers-reduced-motion. Uses transform + opacity only.
 *
 * Implemented with IntersectionObserver + CSS transitions (no animation
 * library) so the landing page ships zero Framer Motion runtime — the reveal
 * effect and props are identical to the previous motion-based version.
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
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setAnimate(false);
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) io.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { rootMargin: "-8% 0px -8% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  const Tag = as;

  if (!animate) {
    return (
      <Tag ref={ref as never} className={className}>
        {children}
      </Tag>
    );
  }

  const hidden =
    from === "up"
      ? `translateY(${distance}px)`
      : from === "down"
        ? `translateY(${-distance}px)`
        : from === "left"
          ? `translateX(${-distance}px)`
          : `translateX(${distance}px)`;

  const ease = "cubic-bezier(0.23, 1, 0.32, 1)";
  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translate3d(0, 0, 0)" : hidden,
    transition: `opacity ${duration}s ${ease} ${delay}s, transform ${duration}s ${ease} ${delay}s`,
    willChange: visible ? undefined : "opacity, transform",
  };

  return (
    <Tag ref={ref as never} className={className} style={style}>
      {children}
    </Tag>
  );
}
