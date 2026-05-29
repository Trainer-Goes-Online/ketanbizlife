import type { ClientConfig } from "@/client.config";
import { ScrollReveal } from "./ScrollReveal";
import styles from "./AntiPositioningSection.module.css";

interface Props {
  anti: ClientConfig["antiPositioning"];
}

export function AntiPositioningSection({ anti }: Props) {
  return (
    <section className={`alt ${styles.section}`} aria-labelledby="anti-heading">
      <div className="container">
        <ScrollReveal>
          <h2 id="anti-heading" className={styles.heading}>
            {anti.heading}
          </h2>
        </ScrollReveal>

        <ul className={styles.list}>
          {anti.items.map((item, i) => (
            <ScrollReveal
              as="li"
              key={i}
              delay={0.05 + i * 0.07}
              className={styles.item}
            >
              <span className={styles.cross} aria-hidden="true">
                ×
              </span>
              <span className={styles.text}>{item}</span>
            </ScrollReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
