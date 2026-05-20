import type { SVGProps } from "react";

export type IconName =
  | "factory"
  | "container"
  | "compass"
  | "spark"
  | "scale"
  | "arrow-right"
  | "check"
  | "x"
  | "clock"
  | "globe"
  | "growth"
  | "shield"
  | "calendar"
  | "user"
  | "video"
  | "gift"
  | "lightbulb"
  | "message"
  | "package"
  | "lock"
  | "refresh"
  | "mail"
  | "file-text"
  | "scale-balance"
  | "rupee"
  | "info";

interface Props extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number;
}

/**
 * Unified stroke-based icon system. All icons are 24x24 viewBox, currentColor,
 * 1.5px stroke. Use color via parent CSS (color or stroke).
 */
export function Icon({ name, size = 24, ...rest }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...rest,
  };

  switch (name) {
    case "factory":
      return (
        <svg {...common}>
          <path d="M3 21V10l5 3V10l5 3V7l8 4v10H3z" />
          <path d="M7 17h2M11 17h2M15 17h2" />
        </svg>
      );
    case "container":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="13" rx="1.5" />
          <path d="M7 6v13M11 6v13M15 6v13M19 6v13" />
          <path d="M3 9h18M3 16h18" />
        </svg>
      );
    case "compass":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M15.5 8.5L13 13l-4.5 2.5L11 11l4.5-2.5z" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
        </svg>
      );
    case "scale":
      return (
        <svg {...common}>
          <path d="M12 3v18M5 21h14M7 6l-4 8a4 4 0 0 0 8 0L7 6zM17 6l-4 8a4 4 0 0 0 8 0L17 6z" />
        </svg>
      );
    case "arrow-right":
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="M4 12l5 5L20 6" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case "growth":
      return (
        <svg {...common}>
          <path d="M3 20h18M5 16l4-4 3 3 7-7M16 8h4v4" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
        </svg>
      );
    case "video":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="14" height="12" rx="2" />
          <path d="M17 10l4-2v8l-4-2z" />
        </svg>
      );
    case "gift":
      return (
        <svg {...common}>
          <rect x="3" y="8" width="18" height="4" rx="1" />
          <path d="M12 8v13M4 12v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8" />
          <path d="M12 8c-2 0-4-1-4-3a2 2 0 0 1 4 0c0 2-2 3-4 3M12 8c2 0 4-1 4-3a2 2 0 0 0-4 0c0 2 2 3 4 3" />
        </svg>
      );
    case "lightbulb":
      return (
        <svg {...common}>
          <path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10.5c-.5.5-1 1-1 2v.5H9V15.5c0-1-.5-1.5-1-2A6 6 0 0 1 12 3z" />
        </svg>
      );
    case "message":
      return (
        <svg {...common}>
          <path d="M21 12a8 8 0 0 1-8 8H5l3-3a8 8 0 1 1 13-5z" />
        </svg>
      );
    case "package":
      return (
        <svg {...common}>
          <path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" />
          <path d="M3 7l9 4 9-4M12 11v10" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="4.5" y="11" width="15" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          <circle cx="12" cy="16" r="1.2" />
        </svg>
      );
    case "refresh":
      return (
        <svg {...common}>
          <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
          <path d="M3 21v-5h5" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 7 9-7" />
        </svg>
      );
    case "file-text":
      return (
        <svg {...common}>
          <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
          <path d="M14 3v6h6" />
          <path d="M8 13h8M8 17h8M8 9h2" />
        </svg>
      );
    case "scale-balance":
      return (
        <svg {...common}>
          <path d="M12 3v18" />
          <path d="M5 21h14" />
          <path d="M6 7h12" />
          <path d="M6 7l-3 6a3 3 0 0 0 6 0z" />
          <path d="M18 7l-3 6a3 3 0 0 0 6 0z" />
        </svg>
      );
    case "rupee":
      return (
        <svg {...common}>
          <path d="M7 5h11" />
          <path d="M7 9h11" />
          <path d="M7 5c3 0 5 1.5 5 4s-2 4-5 4h-1l8 8" />
        </svg>
      );
    case "info":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v6" />
          <circle cx="12" cy="8" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}
