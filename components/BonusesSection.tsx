import type { ClientConfig } from "@/client.config";
import { BonusIllustration } from "./BonusIllustration";
import { ScrollReveal } from "./ScrollReveal";
import styles from "./BonusesSection.module.css";

interface Props {
  bonuses: ClientConfig["bonuses"];
}

export function BonusesSection({ bonuses }: Props) {
  return (
    <section
      className={`alt ${styles.section}`}
      aria-labelledby="bonuses-heading"
    >
      <div className="container">
        <ScrollReveal>
          <p className={styles.eyebrow}>{bonuses.eyebrow}</p>
          <h2 id="bonuses-heading" className={styles.heading}>
            {bonuses.heading}
          </h2>
          <p className={styles.subheading}>{bonuses.subheading}</p>
        </ScrollReveal>

        <div className={styles.grid}>
          {bonuses.cards.map((card, i) => (
            <ScrollReveal
              key={card.illustration}
              as="article"
              className={styles.card}
              delay={0.06 + i * 0.05}
            >
              <div className={styles.visual}>
                <BonusIllustration variant={card.illustration} />
              </div>
              <div className={styles.body}>
                <span className={styles.label}>{card.label}</span>
                <h3 className={styles.title}>{card.title}</h3>
                <p className={styles.description}>{card.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
