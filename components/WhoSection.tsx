import type { ClientConfig } from "@/client.config";
import { ScrollReveal } from "./ScrollReveal";
import { SectionCTA } from "./SectionCTA";
import styles from "./WhoSection.module.css";

interface Props {
  who: ClientConfig["who"];
  checkoutHref: string;
}

export function WhoSection({ who, checkoutHref }: Props) {
  return (
    <section className={styles.section} aria-labelledby="who-heading">
      <div className="container">
        <ScrollReveal>
          <h2 id="who-heading" className={styles.heading}>
            {who.heading}
          </h2>
          <p className={styles.intro}>{who.intro}</p>
        </ScrollReveal>

        <div className={styles.grid}>
          {who.segments.map((segment, i) => (
            <ScrollReveal key={segment.badge} delay={0.1 + i * 0.1}>
              <article className={styles.card}>
                <header className={styles.cardHead}>
                  <span className={styles.icon} aria-hidden="true">
                    {segment.icon}
                  </span>
                  <span className={styles.badge}>{segment.badge}</span>
                </header>
                <p className={styles.lead}>{segment.identityLead}</p>
                <p className={styles.ticksHeading}>{segment.ticksHeading}</p>
                <ul className={styles.bullets}>
                  {segment.bullets.map((bullet, j) => (
                    <li key={j} className={styles.bullet}>
                      <span className={styles.tick} aria-hidden="true">
                        ✓
                      </span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <p className={styles.outcome}>
                  <em>{segment.outcome}</em>
                </p>
              </article>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.2}>
          <p className={styles.closingLine}>{who.closingLine}</p>
        </ScrollReveal>

        <SectionCTA text={who.ctaText} href={checkoutHref} />
      </div>
    </section>
  );
}
