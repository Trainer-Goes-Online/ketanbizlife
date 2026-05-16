import type { ClientConfig } from "@/client.config";
import { ScrollReveal } from "./ScrollReveal";
import { SectionCTA } from "./SectionCTA";
import styles from "./RajaProductSection.module.css";

interface Props {
  raja: ClientConfig["rajaProduct"];
  checkoutHref: string;
}

export function RajaProductSection({ raja, checkoutHref }: Props) {
  return (
    <section className={`alt ${styles.section}`} aria-labelledby="raja-heading">
      <div className="container">
        <ScrollReveal>
          <p className={styles.eyebrow}>{raja.eyebrow}</p>
          <h2 id="raja-heading" className={styles.heading}>
            {raja.headline}
          </h2>
          <p className={styles.openingLine}>
            <em>{raja.openingLine}</em>
          </p>
        </ScrollReveal>

        <div className={styles.blocks}>
          {raja.blocks.map((block, i) => (
            <ScrollReveal key={i} delay={0.1 + i * 0.08}>
              <article className={styles.block}>
                <div className={styles.blockMeta}>
                  <span className={styles.blockTag}>{block.tag}</span>
                </div>
                <h3 className={styles.blockTitle}>{block.title}</h3>
                <p className={styles.blockBody}>{block.body}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>

        <SectionCTA text={raja.ctaText} href={checkoutHref} />
      </div>
    </section>
  );
}
