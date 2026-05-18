"use client";

import { useState } from "react";
import styles from "./VideoTestimonial.module.css";

interface Props {
  youtubeId: string;
  title: string;
  /** Optional custom thumbnail URL; defaults to YouTube's hqdefault */
  thumbnail?: string;
}

/**
 * 16:9 embed-on-click YouTube player. Renders a video-player-style placeholder
 * with progress bar, play button, label, and faux duration when no youtubeId
 * is set. When a real ID is provided, shows the thumbnail until clicked then
 * swaps in the iframe.
 */
export function VideoTestimonial({ youtubeId, title, thumbnail }: Props) {
  const [loaded, setLoaded] = useState(false);

  if (!youtubeId) {
    return (
      <div
        className={styles.placeholder}
        aria-label={`${title} — coming soon`}
        role="img"
      >
        <span className={styles.placeholderLabel}>Coming Soon</span>
        <span className={styles.placeholderPlay} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <span className={styles.placeholderText}>{title}</span>
        <span className={styles.placeholderDuration}>0:42</span>
      </div>
    );
  }

  const thumbnailUrl =
    thumbnail ?? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;

  if (!loaded) {
    return (
      <button
        type="button"
        className={styles.thumbBtn}
        onClick={() => setLoaded(true)}
        aria-label={`Play video: ${title}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt={title}
          loading="lazy"
          className={styles.thumb}
        />
        <span className={styles.playBtn} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </button>
    );
  }

  return (
    <div className={styles.embed}>
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
