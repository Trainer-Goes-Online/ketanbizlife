"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./VideoTestimonial.module.css";

interface Props {
  /** Wistia media ID. Either this or vimeoId must be set. */
  wistiaId?: string;
  /** Vimeo video ID. Either this or wistiaId must be set. */
  vimeoId?: string;
  /** Pre-resolved high-res still-frame URL (parent fetches from provider API). */
  thumbnail: string;
}

const DESKTOP_BREAKPOINT = "(min-width: 1024px)";
const WISTIA_SCRIPT_SRC = "https://fast.wistia.com/player.js";

/**
 * Inject the Wistia player.js script once for the page. Pre-loading on
 * mount means the <wistia-player> custom element is already defined by
 * the time the user clicks — so its connectedCallback (which calls
 * play()) runs inside the same task as the click gesture, and the
 * browser permits autoplay with sound.
 */
function ensureWistiaPlayerScript() {
  if (typeof document === "undefined") return;
  if (document.querySelector(`script[src="${WISTIA_SCRIPT_SRC}"]`)) return;
  const script = document.createElement("script");
  script.src = WISTIA_SCRIPT_SRC;
  script.async = true;
  document.head.appendChild(script);
}

/**
 * 9:16 portrait testimonial card. Click to play.
 * - Desktop (>=1024px): swaps the card with an inline player.
 * - Mobile/tablet (<1024px): opens a fullscreen modal with the player.
 * In both cases the video starts unmuted on the first click — Wistia
 * uses the <wistia-player> web component (same-origin context, so the
 * click gesture activates the underlying <video> element with sound).
 * Vimeo entries still use the iframe embed.
 */
export function VideoTestimonial({ wistiaId, vimeoId, thumbnail }: Props) {
  const [inlinePlaying, setInlinePlaying] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Pre-load the Wistia script on mount so the player is ready the
    // moment the user clicks.
    if (wistiaId) ensureWistiaPlayerScript();
  }, [wistiaId]);

  useEffect(() => {
    if (!modalOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [modalOpen]);

  const hasVideo = Boolean(wistiaId || vimeoId);

  if (!hasVideo) {
    return (
      <div className={styles.card} aria-label="Testimonial coming soon">
        <span className={styles.cardLabel}>Coming Soon</span>
        <span className={styles.playBtnDisabled} aria-hidden="true">
          <PlayIcon />
        </span>
      </div>
    );
  }

  const playerNode = wistiaId ? (
    <wistia-player
      media-id={wistiaId}
      autoplay="true"
      muted="false"
      playsinline="true"
      player-color="2F6BFF"
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  ) : vimeoId ? (
    <iframe
      src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&playsinline=1&title=0&byline=0&portrait=0&color=2F6BFF`}
      title="Testimonial video"
      allow="autoplay; fullscreen"
      allowFullScreen
      className={styles.inlineIframe}
    />
  ) : null;

  if (inlinePlaying) {
    return <div className={styles.embedFrame}>{playerNode}</div>;
  }

  const handlePlay = () => {
    if (wistiaId) ensureWistiaPlayerScript();
    const isDesktop =
      typeof window !== "undefined" &&
      window.matchMedia(DESKTOP_BREAKPOINT).matches;
    if (isDesktop) {
      setInlinePlaying(true);
    } else {
      setModalOpen(true);
    }
  };

  return (
    <>
      <button
        type="button"
        className={styles.card}
        onClick={handlePlay}
        aria-label="Play testimonial video"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnail}
          alt=""
          loading="lazy"
          className={styles.thumb}
        />
        <span className={styles.playBtn} aria-hidden="true">
          <PlayIcon />
        </span>
      </button>

      {mounted &&
        modalOpen &&
        createPortal(
          <div
            className={styles.modal}
            onClick={() => setModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Testimonial video"
          >
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setModalOpen(false)}
              aria-label="Close video"
            >
              <CloseIcon />
            </button>
            <div
              className={styles.modalInner}
              onClick={(e) => e.stopPropagation()}
            >
              {playerNode}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
