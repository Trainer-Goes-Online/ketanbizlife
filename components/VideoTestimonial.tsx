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
 * Embed-on-click YouTube player. Renders a static thumbnail with a play overlay
 * until the user clicks — then swaps in the iframe. Saves significant FCP cost
 * vs auto-loading the iframe.
 */
export function VideoTestimonial({ youtubeId, title, thumbnail }: Props) {
  const [loaded, setLoaded] = useState(false);

  if (!youtubeId) {
    return (
      <div className={styles.placeholder} aria-label={`${title} — coming soon`}>
        <span className={styles.placeholderText}>Coming soon</span>
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
        {/* Using a plain img with eager-lazy because YouTube i.ytimg.com is not configured in next/image domains by default */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt={title}
          loading="lazy"
          className={styles.thumb}
        />
        <span className={styles.playBtn} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
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
