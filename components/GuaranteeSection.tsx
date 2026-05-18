import type { ClientConfig } from "@/client.config";
import { CTAButton } from "./CTAButton";
import { Icon } from "./Icon";
import { ScrollReveal } from "./ScrollReveal";
import styles from "./GuaranteeSection.module.css";

interface Props {
  guarantee: ClientConfig["guarantee"];
  checkoutHref: string;
}

export function GuaranteeSection({ guarantee, checkoutHref }: Props) {
  return (
    <section className={`light ${styles.section}`} aria-labelledby="guarantee-heading">
      <div className="container-narrow">
        <ScrollReveal>
          <div className={styles.card}>
            <div className={styles.badge}>
              <span className={styles.shield} aria-hidden="true">
                <Icon name="shield" size={22} />
              </span>
              <span className={styles.badgeText}>{guarantee.badge}</span>
            </div>

            <h2 id="guarantee-heading" className={styles.heading}>
              {guarantee.heading}
            </h2>

            <div className={styles.body}>
              {guarantee.paragraphs.map((p, i) => (
                <p key={i} className={styles.paragraph}>
                  {p}
                </p>
              ))}
            </div>

            <div className={styles.ctaWrap}>
              <CTAButton
                href={checkoutHref}
                variant="primary"
                size="large"
                withArrow
              >
                {guarantee.ctaText}
              </CTAButton>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
