import styles from "./AboutVisual.module.css";

/**
 * Brand-color SVG placeholder for the About section visual.
 * Container yard / port loading motif. Drops in until real B-roll footage
 * is provided.
 */
export function AboutVisual() {
  const ACCENT = "#4DA3FF";
  const ACCENT_DEEP = "#2F6BFF";
  const GOLD = "#F5B042";
  const FAINT = "rgba(120, 160, 255, 0.18)";

  return (
    <svg
      viewBox="0 0 360 260"
      className={styles.svg}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="abGlow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={ACCENT_DEEP} stopOpacity="0.32" />
          <stop offset="100%" stopColor={ACCENT_DEEP} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="abHorizon" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#0d1326" stopOpacity="0" />
          <stop offset="100%" stopColor="#0d1326" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      <rect width="360" height="260" fill="rgba(255,255,255,0.01)" />
      <circle cx="180" cy="100" r="160" fill="url(#abGlow)" />

      {/* Horizon line */}
      <line
        x1="20"
        y1="170"
        x2="340"
        y2="170"
        stroke={FAINT}
        strokeWidth="1"
      />

      {/* Crane gantry, left */}
      <g stroke={ACCENT} strokeWidth="1.4" strokeLinecap="round">
        <line x1="38" y1="60" x2="38" y2="170" />
        <line x1="108" y1="60" x2="108" y2="170" />
        <line x1="38" y1="60" x2="108" y2="60" />
        <line x1="73" y1="60" x2="73" y2="100" />
      </g>
      {/* Crane hook */}
      <rect
        x="63"
        y="100"
        width="20"
        height="14"
        rx="2"
        stroke={GOLD}
        strokeWidth="1.4"
        fill="rgba(245,176,66,0.16)"
      />

      {/* Container stack (rear) */}
      <g>
        <rect
          x="130"
          y="130"
          width="80"
          height="38"
          rx="2"
          stroke={ACCENT}
          strokeWidth="1.4"
          fill="rgba(47,107,255,0.1)"
        />
        <rect
          x="220"
          y="130"
          width="80"
          height="38"
          rx="2"
          stroke={ACCENT}
          strokeWidth="1.4"
          fill="rgba(47,107,255,0.06)"
        />
        {/* Container ridges */}
        <g stroke={ACCENT} strokeWidth="1" opacity="0.4">
          <line x1="140" y1="138" x2="140" y2="160" />
          <line x1="155" y1="138" x2="155" y2="160" />
          <line x1="170" y1="138" x2="170" y2="160" />
          <line x1="185" y1="138" x2="185" y2="160" />
          <line x1="200" y1="138" x2="200" y2="160" />
          <line x1="230" y1="138" x2="230" y2="160" />
          <line x1="245" y1="138" x2="245" y2="160" />
          <line x1="260" y1="138" x2="260" y2="160" />
          <line x1="275" y1="138" x2="275" y2="160" />
          <line x1="290" y1="138" x2="290" y2="160" />
        </g>
      </g>

      {/* Container stack (front, in gold accent — the "Raja Product" container) */}
      <rect
        x="160"
        y="92"
        width="80"
        height="38"
        rx="2"
        stroke={GOLD}
        strokeWidth="1.6"
        fill="rgba(245,176,66,0.14)"
      />
      <g stroke={GOLD} strokeWidth="1" opacity="0.5">
        <line x1="170" y1="100" x2="170" y2="122" />
        <line x1="185" y1="100" x2="185" y2="122" />
        <line x1="200" y1="100" x2="200" y2="122" />
        <line x1="215" y1="100" x2="215" y2="122" />
        <line x1="230" y1="100" x2="230" y2="122" />
      </g>
      {/* Brand mark on front container */}
      <text
        x="200"
        y="116"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="9"
        fontWeight="700"
        fill={GOLD}
        letterSpacing="0.2em"
      >
        BIZLIFE
      </text>

      {/* Crane gantry, right */}
      <g stroke={ACCENT} strokeWidth="1.4" strokeLinecap="round" opacity="0.7">
        <line x1="280" y1="40" x2="280" y2="170" />
        <line x1="340" y1="40" x2="340" y2="170" />
        <line x1="280" y1="40" x2="340" y2="40" />
      </g>

      {/* Ground reflection */}
      <rect
        x="0"
        y="170"
        width="360"
        height="60"
        fill="url(#abHorizon)"
      />

      {/* Distant ship silhouette */}
      <path
        d="M40 168 L320 168 L300 160 L60 160 Z"
        stroke={ACCENT}
        strokeWidth="1"
        opacity="0.35"
        fill="rgba(47,107,255,0.06)"
      />

      {/* Sun / pulse — gold accent */}
      <circle cx="290" cy="78" r="4" fill={GOLD} />
      <circle cx="290" cy="78" r="9" stroke={GOLD} strokeWidth="1" opacity="0.5" />
    </svg>
  );
}
