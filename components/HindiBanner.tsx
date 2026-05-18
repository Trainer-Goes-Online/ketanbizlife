import styles from "./HindiBanner.module.css";

interface Props {
  text: string;
}

/**
 * Renders Hindi/Devanagari text using Noto Sans Devanagari (Fraunces doesn't
 * cover Devanagari glyphs). Includes a leading pulse dot as a "live" indicator.
 */
export function HindiBanner({ text }: Props) {
  return (
    <p className={styles.banner} lang="hi">
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.text}>{text}</span>
    </p>
  );
}
