import type { ClientConfig } from "@/client.config";
import { ScrollReveal } from "./ScrollReveal";
import styles from "./TransformationTable.module.css";

interface Props {
  transformation: ClientConfig["transformation"];
}

export function TransformationTable({ transformation }: Props) {
  return (
    <section className={`light ${styles.section}`} aria-labelledby="transformation-heading">
      <div className="container">
        <ScrollReveal>
          <h2 id="transformation-heading" className={styles.heading}>
            {transformation.heading}
          </h2>
        </ScrollReveal>

        <div className={styles.tableWrap} role="table" aria-label="Old vs new comparison">
          <div className={styles.header} role="row">
            <div className={styles.headerOld} role="columnheader">
              {transformation.headerOld}
            </div>
            <div className={styles.headerNext} role="columnheader">
              {transformation.headerNext}
            </div>
          </div>

          <div className={styles.rows}>
            {transformation.rows.map((row, i) => (
              <ScrollReveal key={i} delay={0.05 + i * 0.06}>
                <div className={styles.row} role="row">
                  <div className={styles.cellOld} role="cell">
                    <span className={styles.iconOld} aria-hidden="true">
                      ×
                    </span>
                    <span className={styles.cellText}>{row.old}</span>
                  </div>
                  <div className={styles.cellNext} role="cell">
                    <span className={styles.iconNext} aria-hidden="true">
                      ✓
                    </span>
                    <span className={styles.cellText}>{row.next}</span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <ScrollReveal delay={0.2}>
          <p className={styles.outro}>{transformation.outro}</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
