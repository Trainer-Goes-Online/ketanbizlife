import type { ClientConfig } from "@/client.config";
import { CTAButton } from "./CTAButton";
import { ScrollReveal } from "./ScrollReveal";
import styles from "./FinalCtaSection.module.css";

interface Props {
  finalCta: ClientConfig["finalCta"];
  checkoutHref: string;
}

export function FinalCtaSection({ finalCta, checkoutHref }: Props) {
  return (
    <section className={`alt ${styles.section}`} aria-labelledby="final-cta-heading">
      <div className="container-narrow">
        <ScrollReveal>
          <h2 id="final-cta-heading" className={styles.heading}>
            {finalCta.heading}
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <div className={styles.antiQualifier}>
            <p>
              <em>{finalCta.antiQualifier}</em>
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.16}>
          <p className={styles.body}>{finalCta.body}</p>
        </ScrollReveal>

        <ScrollReveal delay={0.24}>
          <p className={styles.closing}>{finalCta.closing}</p>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className={styles.ctaWrap}>
            <CTAButton
              href={checkoutHref}
              variant="primary"
              size="large"
              withArrow
            >
              {finalCta.ctaText}
            </CTAButton>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.36}>
          <p className={styles.fineprint}>{finalCta.fineprint}</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
