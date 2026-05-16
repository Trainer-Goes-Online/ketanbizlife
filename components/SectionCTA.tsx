import { CTAButton } from "./CTAButton";
import styles from "./SectionCTA.module.css";

interface Props {
  text: string;
  href: string;
}

/**
 * Wraps a primary CTA in a vertically-padded, horizontally-centered block.
 * Used between sections to keep the CTA rhythm consistent.
 */
export function SectionCTA({ text, href }: Props) {
  return (
    <div className={styles.wrap}>
      <CTAButton href={href} variant="primary" size="large" withArrow>
        {text}
      </CTAButton>
    </div>
  );
}
