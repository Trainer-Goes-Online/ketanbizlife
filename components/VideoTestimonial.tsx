"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import styles from "./VideoTestimonial.module.css";

interface Props {
  /** Wistia media ID. Used for the iframe fallback when mp4Url is absent. */
  wistiaId?: string;
  /** Vimeo video ID. Vimeo always renders as an iframe. */
  vimeoId?: string;
  /** Full Tella embed iframe src. Renders as an iframe (like Vimeo). Tella
   *  locks the embed to the brand domain, so it only plays in production. */
  tellaEmbedUrl?: string;
  /** Direct MP4 URL extracted from Wistia metadata (server-side fetched).
   *  When set, we render an HTML5 <video> element — this is the only
   *  reliable mobile autoplay-with-sound path. */
  mp4Url?: string;
  /** Pre-resolved high-res still-frame URL (parent fetches from provider API). */
  thumbnail: string;
}

const DESKTOP_BREAKPOINT = "(min-width: 1024px)";

/**
 * 9:16 portrait testimonial card. Click to play.
 *
 * Playback strategy and why it's structured this way:
 *
 * - Mobile browsers (esp. iOS Safari) only permit autoplay-with-sound
 *   when video.play() is invoked SYNCHRONOUSLY inside a user gesture
 *   handler. Any async delay (setTimeout, microtask, useEffect, iframe
 *   load round-trip) causes Safari to mute or block playback.
 * - The iframe approach (Wistia's <wistia-player> or Wistia iframe
 *   embed) hands off to Wistia's player.js, which calls .play() after
 *   the iframe has loaded — that's well outside the gesture window.
 *   This is why Wistia iframes failed on real mobile devices.
 * - The fix: an HTML5 <video> element with the MP4 hotlink from
 *   Wistia's metadata. We render it eagerly via flushSync so the
 *   element exists in the DOM before this handler returns, then call
 *   videoRef.current.play() synchronously — still inside the gesture.
 * - Vimeo iframe is kept (Vimeo doesn't expose simple MP4 hotlinks)
 *   and works because Vimeo's player handles gesture propagation well.
 * - If MP4 extraction failed server-side, we fall back to the Wistia
 *   iframe embed (best-effort — may not autoplay on mobile, but the
 *   user can tap Wistia's in-iframe play button).
 */
export function VideoTestimonial({
  wistiaId,
  vimeoId,
  tellaEmbedUrl,
  mp4Url,
  thumbnail,
}: Props) {
  const [inlinePlaying, setInlinePlaying] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const hasVideo = Boolean(mp4Url || vimeoId || wistiaId || tellaEmbedUrl);

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

  const playerNode = mp4Url ? (
    <video
      ref={videoRef}
      src={mp4Url}
      controls
      playsInline
      preload="metadata"
      poster={thumbnail}
      className={styles.inlineIframe}
    />
  ) : vimeoId ? (
    <iframe
      src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&playsinline=1&title=0&byline=0&portrait=0&color=2F6BFF`}
      title="Testimonial video"
      allow="autoplay; fullscreen"
      allowFullScreen
      className={styles.inlineIframe}
    />
  ) : tellaEmbedUrl ? (
    <iframe
      src={tellaEmbedUrl}
      title="Testimonial video"
      allow="autoplay; fullscreen"
      allowFullScreen
      className={styles.inlineIframe}
    />
  ) : wistiaId ? (
    <iframe
      src={`https://fast.wistia.net/embed/iframe/${wistiaId}?autoPlay=true&playerColor=2F6BFF&playsinline=true&videoFoam=true`}
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
    const isDesktop =
      typeof window !== "undefined" &&
      window.matchMedia(DESKTOP_BREAKPOINT).matches;

    // flushSync forces React to apply the state update and re-render
    // BEFORE this click handler returns. After this call, the <video>
    // element exists in the DOM and videoRef.current is populated.
    // Without flushSync, the render happens asynchronously after the
    // click handler returns — and by then the user-gesture activation
    // has expired, blocking autoplay-with-sound on mobile.
    flushSync(() => {
      if (isDesktop) setInlinePlaying(true);
      else setModalOpen(true);
    });

    // Synchronous play() call, still inside the click event's task.
    // This is what unlocks unmuted autoplay on iOS Safari and other
    // mobile browsers. If the video element was rendered (mp4Url path),
    // ref is populated by now thanks to flushSync.
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay denied (very rare with this setup). The <video>
        // element shows native controls so the user can tap play.
      });
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
