import styles from "./CredentialsMarquee.module.css";

interface Props {
  items: string[];
}

/**
 * Infinite horizontal scroll marquee. The track contains the items duplicated
 * back-to-back so the CSS animation translates -50% and the second half is
 * visible during loop reset (no visible jump).
 */
export function CredentialsMarquee({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <div className={styles.wrap} aria-label="Credentials and brands">
      <div className={`${styles.track} marquee-track`} aria-hidden="false">
        {[...items, ...items].map((item, i) => (
          <span key={i} className={styles.item}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
