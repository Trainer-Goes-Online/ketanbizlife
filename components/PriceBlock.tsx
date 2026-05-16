import styles from "./PriceBlock.module.css";

interface Props {
  anchor: string;
  actual: string;
  suffix?: string;
  align?: "center" | "left";
}

export function PriceBlock({ anchor, actual, suffix, align = "center" }: Props) {
  return (
    <div className={`${styles.block} ${styles[align]}`} role="group" aria-label="Price">
      <span className={styles.anchor} aria-label={`Original price ${anchor}`}>
        <s>{anchor}</s>
      </span>
      <span className={styles.actual} aria-label={`Today's price ${actual}`}>
        {actual}
      </span>
      {suffix ? <span className={styles.suffix}>{suffix}</span> : null}
    </div>
  );
}
