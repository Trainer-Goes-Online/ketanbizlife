import styles from "./HindiBanner.module.css";

interface Props {
  text: string;
}

/**
 * Renders Hindi/Devanagari text using Noto Sans Devanagari (Fraunces doesn't
 * cover Devanagari glyphs).
 */
export function HindiBanner({ text }: Props) {
  return (
    <p className={styles.banner} lang="hi">
      {text}
    </p>
  );
}
