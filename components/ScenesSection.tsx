import type { ClientConfig } from "@/client.config";
import { ScrollReveal } from "./ScrollReveal";
import styles from "./ScenesSection.module.css";

interface Props {
  scenes: ClientConfig["scenes"];
}

export function ScenesSection({ scenes }: Props) {
  return (
    <section className={`light ${styles.section}`} aria-labelledby="scenes-heading">
      <div className="container-narrow">
        <ScrollReveal>
          <h2 id="scenes-heading" className={styles.heading}>
            {scenes.heading}
          </h2>
        </ScrollReveal>

        <div className={styles.list}>
          {scenes.scenes.map((scene, i) => (
            <ScrollReveal key={i} delay={0.08 + i * 0.08}>
              <p className={styles.scene}>{scene}</p>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.2}>
          <p className={styles.outro}>{scenes.outro}</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
