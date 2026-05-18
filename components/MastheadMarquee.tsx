import styles from "./MastheadMarquee.module.css";

interface Props {
  items: string[];
}

/**
 * Top-edge running brand strip. Quiet, slow, infinite scroll.
 */
export function MastheadMarquee({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <div className={styles.wrap} aria-label="Brand marquee">
      <div className={`${styles.track} marquee-track`}>
        {[...items, ...items].map((item, i) => (
          <span key={i} className={styles.item}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
