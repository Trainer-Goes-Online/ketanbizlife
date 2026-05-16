import type { ClientConfig } from "@/client.config";
import { ScrollReveal } from "./ScrollReveal";
import styles from "./ScenesSection.module.css";

interface Props {
  scenes: ClientConfig["scenes"];
}

export function ScenesSection({ scenes }: Props) {
  return (
    <section className={`alt ${styles.section}`} aria-labelledby="scenes-heading">
      <div className="container-narrow">
        <ScrollReveal>
          <h2 id="scenes-heading" className={styles.heading}>
            {scenes.heading}
          </h2>
        </ScrollReveal>

        <ul className={styles.list}>
          {scenes.scenes.map((scene, i) => (
            <ScrollReveal key={i} delay={0.1 + i * 0.1} as="ul">
              <li className={styles.scene}>{scene}</li>
            </ScrollReveal>
          ))}
        </ul>

        <ScrollReveal delay={0.2}>
          <p className={styles.outro}>{scenes.outro}</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
