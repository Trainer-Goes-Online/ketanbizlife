import styles from "./ActIllustration.module.css";

interface Props {
  /** 1 = scattered (failed years), 2 = converging (system found), 3 = radiating (today) */
  variant: 1 | 2 | 3;
}

/**
 * Brand-color abstract illustrations for the About 3-act story.
 * Stroke-based, royal blue + gold. Subtle motion via parent .lift hover.
 */
export function ActIllustration({ variant }: Props) {
  if (variant === 1) return <ScatteredVariant />;
  if (variant === 2) return <ConvergingVariant />;
  return <RadiatingVariant />;
}

/** Act 01 — Failed Years. Scattered, broken connections, diffuse paths. */
function ScatteredVariant() {
  return (
    <svg
      viewBox="0 0 240 200"
      className={styles.svg}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="act1Glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2F6BFF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#2F6BFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="120" cy="100" r="80" fill="url(#act1Glow)" />

      {/* Scattered nodes */}
      <circle cx="50" cy="55" r="3" fill="#4DA3FF" opacity="0.6" />
      <circle cx="90" cy="35" r="2" fill="#4DA3FF" opacity="0.4" />
      <circle cx="180" cy="50" r="2.5" fill="#F5B042" opacity="0.5" />
      <circle cx="70" cy="120" r="2" fill="#4DA3FF" opacity="0.5" />
      <circle cx="200" cy="140" r="3" fill="#4DA3FF" opacity="0.7" />
      <circle cx="140" cy="165" r="2" fill="#F5B042" opacity="0.5" />
      <circle cx="30" cy="170" r="2.5" fill="#4DA3FF" opacity="0.4" />

      {/* Broken lines — paths that don't connect */}
      <path
        d="M50 55 L70 70"
        stroke="#4DA3FF"
        strokeWidth="1"
        strokeDasharray="3 4"
        opacity="0.4"
      />
      <path
        d="M90 35 L130 60"
        stroke="#4DA3FF"
        strokeWidth="1"
        strokeDasharray="3 4"
        opacity="0.35"
      />
      <path
        d="M180 50 L160 90"
        stroke="#F5B042"
        strokeWidth="1"
        strokeDasharray="3 4"
        opacity="0.3"
      />
      <path
        d="M70 120 L110 130"
        stroke="#4DA3FF"
        strokeWidth="1"
        strokeDasharray="3 4"
        opacity="0.4"
      />
      <path
        d="M200 140 L180 110"
        stroke="#4DA3FF"
        strokeWidth="1"
        strokeDasharray="3 4"
        opacity="0.35"
      />

      {/* Centered question mark — symbolizes the missing piece */}
      <circle
        cx="120"
        cy="100"
        r="22"
        stroke="#2F6BFF"
        strokeWidth="1.2"
        opacity="0.4"
      />
      <circle
        cx="120"
        cy="100"
        r="14"
        stroke="#2F6BFF"
        strokeWidth="1"
        strokeDasharray="2 3"
        opacity="0.3"
      />
    </svg>
  );
}

/** Act 02 — System Built. Converging lines into a structured center. */
function ConvergingVariant() {
  return (
    <svg
      viewBox="0 0 240 200"
      className={styles.svg}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="act2Glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2F6BFF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#2F6BFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="act2Line" x1="0" x2="1">
          <stop offset="0%" stopColor="#4DA3FF" stopOpacity="0" />
          <stop offset="100%" stopColor="#4DA3FF" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <circle cx="120" cy="100" r="90" fill="url(#act2Glow)" />

      {/* Center hub */}
      <circle
        cx="120"
        cy="100"
        r="26"
        stroke="#2F6BFF"
        strokeWidth="1.4"
        opacity="0.6"
      />
      <circle cx="120" cy="100" r="6" fill="#F5B042" />
      <circle
        cx="120"
        cy="100"
        r="6"
        stroke="#F5B042"
        strokeWidth="1"
        opacity="0.5"
      />

      {/* Converging lines from outer points */}
      <path d="M20 40 L100 92" stroke="url(#act2Line)" strokeWidth="1.3" />
      <path
        d="M30 100 L98 100"
        stroke="url(#act2Line)"
        strokeWidth="1.3"
      />
      <path d="M20 160 L100 110" stroke="url(#act2Line)" strokeWidth="1.3" />
      <path d="M220 40 L140 92" stroke="url(#act2Line)" strokeWidth="1.3" transform="rotate(180 120 100)" />
      <path
        d="M210 100 L142 100"
        stroke="url(#act2Line)"
        strokeWidth="1.3"
        transform="rotate(180 120 100)"
      />
      <path d="M220 160 L140 110" stroke="url(#act2Line)" strokeWidth="1.3" transform="rotate(180 120 100)" />

      {/* Outer entry nodes */}
      <circle cx="20" cy="40" r="3" fill="#4DA3FF" opacity="0.7" />
      <circle cx="30" cy="100" r="3" fill="#4DA3FF" opacity="0.7" />
      <circle cx="20" cy="160" r="3" fill="#4DA3FF" opacity="0.7" />
      <circle cx="220" cy="40" r="3" fill="#4DA3FF" opacity="0.7" />
      <circle cx="210" cy="100" r="3" fill="#4DA3FF" opacity="0.7" />
      <circle cx="220" cy="160" r="3" fill="#4DA3FF" opacity="0.7" />
    </svg>
  );
}

/** Act 03 — Today. Radiating from center outward to many points. */
function RadiatingVariant() {
  return (
    <svg
      viewBox="0 0 240 200"
      className={styles.svg}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="act3Glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2F6BFF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#2F6BFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="act3Line" x1="0" x2="1">
          <stop offset="0%" stopColor="#F5B042" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#F5B042" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="120" cy="100" r="95" fill="url(#act3Glow)" />

      {/* Center radiating point */}
      <circle cx="120" cy="100" r="5" fill="#F5B042" />
      <circle
        cx="120"
        cy="100"
        r="10"
        stroke="#F5B042"
        strokeWidth="1.5"
        opacity="0.7"
      />
      <circle
        cx="120"
        cy="100"
        r="22"
        stroke="#4DA3FF"
        strokeWidth="1"
        opacity="0.5"
        strokeDasharray="2 4"
      />
      <circle
        cx="120"
        cy="100"
        r="40"
        stroke="#4DA3FF"
        strokeWidth="1"
        opacity="0.3"
      />

      {/* Radiating connections to destinations */}
      <path d="M120 100 L40 30" stroke="url(#act3Line)" strokeWidth="1.3" />
      <path d="M120 100 L210 25" stroke="url(#act3Line)" strokeWidth="1.3" />
      <path d="M120 100 L30 100" stroke="url(#act3Line)" strokeWidth="1.3" />
      <path d="M120 100 L215 110" stroke="url(#act3Line)" strokeWidth="1.3" />
      <path d="M120 100 L50 170" stroke="url(#act3Line)" strokeWidth="1.3" />
      <path d="M120 100 L200 175" stroke="url(#act3Line)" strokeWidth="1.3" />

      {/* Destination nodes */}
      <circle cx="40" cy="30" r="3.5" fill="#4DA3FF" />
      <circle
        cx="40"
        cy="30"
        r="6"
        stroke="#4DA3FF"
        strokeWidth="1"
        opacity="0.4"
      />
      <circle cx="210" cy="25" r="3.5" fill="#4DA3FF" />
      <circle
        cx="210"
        cy="25"
        r="6"
        stroke="#4DA3FF"
        strokeWidth="1"
        opacity="0.4"
      />
      <circle cx="30" cy="100" r="3.5" fill="#4DA3FF" />
      <circle
        cx="30"
        cy="100"
        r="6"
        stroke="#4DA3FF"
        strokeWidth="1"
        opacity="0.4"
      />
      <circle cx="215" cy="110" r="3.5" fill="#4DA3FF" />
      <circle
        cx="215"
        cy="110"
        r="6"
        stroke="#4DA3FF"
        strokeWidth="1"
        opacity="0.4"
      />
      <circle cx="50" cy="170" r="3.5" fill="#4DA3FF" />
      <circle
        cx="50"
        cy="170"
        r="6"
        stroke="#4DA3FF"
        strokeWidth="1"
        opacity="0.4"
      />
      <circle cx="200" cy="175" r="3.5" fill="#4DA3FF" />
      <circle
        cx="200"
        cy="175"
        r="6"
        stroke="#4DA3FF"
        strokeWidth="1"
        opacity="0.4"
      />
    </svg>
  );
}
