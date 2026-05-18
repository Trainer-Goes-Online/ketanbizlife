/**
 * TypeScript declaration for Wistia's `<wistia-player>` web component.
 * Loaded via `https://fast.wistia.com/player.js`. Used instead of the
 * iframe embed because the web component renders in our DOM, so browser
 * autoplay policies treat the user's click gesture as a same-origin
 * activation and permit autoplay with sound.
 *
 * React 19 moved JSX out of the global namespace into the react module,
 * so we augment `react`'s JSX.IntrinsicElements directly.
 */
import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "wistia-player": DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        "media-id"?: string;
        autoplay?: "true" | "false";
        muted?: "true" | "false";
        playsinline?: "true" | "false";
        "player-color"?: string;
        "aspect-ratio"?: string;
      };
    }
  }
}
