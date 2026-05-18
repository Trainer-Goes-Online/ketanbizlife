import styles from "./BonusIllustration.module.css";

type Variant = "verification" | "fob" | "community" | "lms" | "recording";

interface Props {
  variant: Variant;
}

/**
 * Brand-color SVG illustrations for the Bonuses section.
 * Stroke-based geometric language, royal blue + gold + soft glow.
 */
export function BonusIllustration({ variant }: Props) {
  switch (variant) {
    case "verification":
      return <Verification />;
    case "fob":
      return <Fob />;
    case "community":
      return <Community />;
    case "lms":
      return <Lms />;
    case "recording":
      return <Recording />;
  }
}

const ACCENT = "#4DA3FF";
const ACCENT_DEEP = "#2F6BFF";
const GOLD = "#F5B042";
const FAINT = "rgba(120, 160, 255, 0.18)";

/* ---------- 1. 5-Step Buyer Verification Checklist ---------- */
function Verification() {
  return (
    <svg
      viewBox="0 0 220 160"
      className={styles.svg}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="b1Glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={ACCENT_DEEP} stopOpacity="0.28" />
          <stop offset="100%" stopColor={ACCENT_DEEP} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="110" cy="80" r="80" fill="url(#b1Glow)" />

      {/* Shield */}
      <path
        d="M110 26 L150 40 V80 C150 110 130 128 110 138 C90 128 70 110 70 80 V40 Z"
        stroke={ACCENT}
        strokeWidth="1.6"
        fill="rgba(47,107,255,0.08)"
      />

      {/* Checklist items inside shield */}
      <g stroke={ACCENT} strokeWidth="1.4" strokeLinecap="round">
        <line x1="86" y1="56" x2="134" y2="56" opacity="0.4" />
        <line x1="86" y1="72" x2="134" y2="72" opacity="0.45" />
        <line x1="86" y1="88" x2="134" y2="88" opacity="0.5" />
        <line x1="86" y1="104" x2="134" y2="104" opacity="0.45" />
        <line x1="86" y1="120" x2="134" y2="120" opacity="0.35" />
      </g>

      {/* Check mark badge */}
      <circle cx="148" cy="46" r="12" fill={GOLD} />
      <path
        d="M142 46 L147 51 L154 42"
        stroke="#1a1d27"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/* ---------- 2. Perfect FOB Price Calculation Sheet ---------- */
function Fob() {
  return (
    <svg
      viewBox="0 0 220 160"
      className={styles.svg}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="b2Glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={ACCENT_DEEP} stopOpacity="0.25" />
          <stop offset="100%" stopColor={ACCENT_DEEP} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="110" cy="80" r="78" fill="url(#b2Glow)" />

      {/* Calculator/spreadsheet */}
      <rect
        x="56"
        y="30"
        width="108"
        height="100"
        rx="10"
        stroke={ACCENT}
        strokeWidth="1.6"
        fill="rgba(47,107,255,0.06)"
      />
      {/* Header row */}
      <rect
        x="56"
        y="30"
        width="108"
        height="20"
        rx="10"
        fill="rgba(47,107,255,0.18)"
      />
      <text
        x="110"
        y="44"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="10"
        fontWeight="600"
        fill={ACCENT}
        letterSpacing="0.15em"
      >
        FOB
      </text>
      {/* Grid lines */}
      <g stroke={FAINT} strokeWidth="1">
        <line x1="56" y1="68" x2="164" y2="68" />
        <line x1="56" y1="86" x2="164" y2="86" />
        <line x1="56" y1="104" x2="164" y2="104" />
        <line x1="110" y1="50" x2="110" y2="130" />
      </g>
      {/* Cell content */}
      <g stroke={ACCENT} strokeWidth="1.3" strokeLinecap="round">
        <line x1="68" y1="60" x2="92" y2="60" opacity="0.5" />
        <line x1="120" y1="60" x2="152" y2="60" opacity="0.5" />
        <line x1="68" y1="78" x2="92" y2="78" opacity="0.5" />
        <line x1="120" y1="78" x2="152" y2="78" opacity="0.5" />
        <line x1="68" y1="96" x2="92" y2="96" opacity="0.5" />
        <line x1="120" y1="96" x2="152" y2="96" opacity="0.5" />
      </g>
      {/* Total row in gold */}
      <line x1="68" y1="118" x2="92" y2="118" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="120" y1="118" x2="152" y2="118" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- 3. WhatsApp Community ---------- */
function Community() {
  return (
    <svg
      viewBox="0 0 220 160"
      className={styles.svg}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="b3Glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={ACCENT_DEEP} stopOpacity="0.3" />
          <stop offset="100%" stopColor={ACCENT_DEEP} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="110" cy="80" r="80" fill="url(#b3Glow)" />

      {/* Network nodes - center hub + 4 satellites */}
      {/* Connection lines */}
      <g stroke={ACCENT} strokeWidth="1.3" opacity="0.45">
        <line x1="110" y1="80" x2="50" y2="40" />
        <line x1="110" y1="80" x2="170" y2="40" />
        <line x1="110" y1="80" x2="50" y2="125" />
        <line x1="110" y1="80" x2="170" y2="125" />
      </g>

      {/* Center large message bubble */}
      <circle
        cx="110"
        cy="80"
        r="22"
        stroke={GOLD}
        strokeWidth="1.6"
        fill="rgba(245,176,66,0.12)"
      />
      <g stroke={GOLD} strokeWidth="1.4" strokeLinecap="round">
        <line x1="100" y1="76" x2="120" y2="76" />
        <line x1="100" y1="82" x2="116" y2="82" />
        <line x1="100" y1="88" x2="118" y2="88" />
      </g>

      {/* Satellite bubbles */}
      <circle
        cx="50"
        cy="40"
        r="12"
        stroke={ACCENT}
        strokeWidth="1.4"
        fill="rgba(47,107,255,0.12)"
      />
      <circle
        cx="170"
        cy="40"
        r="12"
        stroke={ACCENT}
        strokeWidth="1.4"
        fill="rgba(47,107,255,0.12)"
      />
      <circle
        cx="50"
        cy="125"
        r="12"
        stroke={ACCENT}
        strokeWidth="1.4"
        fill="rgba(47,107,255,0.12)"
      />
      <circle
        cx="170"
        cy="125"
        r="12"
        stroke={ACCENT}
        strokeWidth="1.4"
        fill="rgba(47,107,255,0.12)"
      />

      {/* Satellite dots inside */}
      <circle cx="50" cy="40" r="3" fill={ACCENT} />
      <circle cx="170" cy="40" r="3" fill={ACCENT} />
      <circle cx="50" cy="125" r="3" fill={ACCENT} />
      <circle cx="170" cy="125" r="3" fill={ACCENT} />
    </svg>
  );
}

/* ---------- 4. Mobile App + LMS ---------- */
function Lms() {
  return (
    <svg
      viewBox="0 0 220 160"
      className={styles.svg}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="b4Glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={ACCENT_DEEP} stopOpacity="0.28" />
          <stop offset="100%" stopColor={ACCENT_DEEP} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="110" cy="80" r="80" fill="url(#b4Glow)" />

      {/* Laptop */}
      <rect
        x="56"
        y="42"
        width="110"
        height="74"
        rx="6"
        stroke={ACCENT}
        strokeWidth="1.6"
        fill="rgba(47,107,255,0.06)"
      />
      <path
        d="M46 122 H176 L168 130 H54 Z"
        stroke={ACCENT}
        strokeWidth="1.6"
        fill="rgba(47,107,255,0.1)"
      />
      {/* Screen content lines */}
      <g stroke={ACCENT} strokeWidth="1.2" strokeLinecap="round">
        <line x1="66" y1="56" x2="100" y2="56" opacity="0.55" />
        <line x1="66" y1="66" x2="130" y2="66" opacity="0.4" />
        <line x1="66" y1="76" x2="120" y2="76" opacity="0.4" />
        <line x1="66" y1="86" x2="140" y2="86" opacity="0.4" />
        <line x1="66" y1="96" x2="110" y2="96" opacity="0.4" />
      </g>

      {/* Phone on top */}
      <rect
        x="138"
        y="62"
        width="40"
        height="68"
        rx="6"
        stroke={GOLD}
        strokeWidth="1.6"
        fill="rgba(245,176,66,0.1)"
      />
      <circle cx="158" cy="71" r="1.5" fill={GOLD} opacity="0.7" />
      <g stroke={GOLD} strokeWidth="1.2" strokeLinecap="round">
        <line x1="146" y1="84" x2="170" y2="84" opacity="0.6" />
        <line x1="146" y1="92" x2="166" y2="92" opacity="0.45" />
        <line x1="146" y1="100" x2="168" y2="100" opacity="0.45" />
      </g>
      {/* Play button on phone */}
      <circle cx="158" cy="115" r="6" fill={GOLD} opacity="0.85" />
      <path d="M156 112 L162 115 L156 118 Z" fill="#1a1d27" />
    </svg>
  );
}

/* ---------- 5. 1-Year Recording Access ---------- */
function Recording() {
  return (
    <svg
      viewBox="0 0 220 160"
      className={styles.svg}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="b5Glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={ACCENT_DEEP} stopOpacity="0.3" />
          <stop offset="100%" stopColor={ACCENT_DEEP} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="110" cy="80" r="80" fill="url(#b5Glow)" />

      {/* Outer ring (year orbit) */}
      <circle
        cx="110"
        cy="80"
        r="56"
        stroke={ACCENT}
        strokeWidth="1.4"
        strokeDasharray="2 6"
        opacity="0.4"
      />

      {/* Month markers on orbit */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const x = 110 + Math.cos(angle) * 56;
        const y = 80 + Math.sin(angle) * 56;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i % 3 === 0 ? 3 : 2}
            fill={i % 3 === 0 ? GOLD : ACCENT}
            opacity={i % 3 === 0 ? 0.9 : 0.6}
          />
        );
      })}

      {/* Inner play button circle */}
      <circle
        cx="110"
        cy="80"
        r="30"
        stroke={ACCENT}
        strokeWidth="1.6"
        fill="rgba(47,107,255,0.1)"
      />
      <circle
        cx="110"
        cy="80"
        r="20"
        stroke={GOLD}
        strokeWidth="1.4"
        opacity="0.6"
      />
      {/* Play triangle */}
      <path d="M104 70 L122 80 L104 90 Z" fill={GOLD} />
    </svg>
  );
}
