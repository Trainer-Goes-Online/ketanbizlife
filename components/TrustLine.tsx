import styles from "./TrustLine.module.css";

interface Props {
  text: string;
  refundLine?: string | null;
}

export function TrustLine({ text, refundLine }: Props) {
  return (
    <div className={styles.wrap}>
      <p className={styles.trust}>{text}</p>
      {refundLine ? (
        <p className={styles.refund}>
          <span className={styles.dot} aria-hidden="true">
            ✓
          </span>{" "}
          {refundLine}
        </p>
      ) : null}
    </div>
  );
}
