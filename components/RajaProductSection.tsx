import type { ClientConfig } from "@/client.config";
import { Icon, type IconName } from "./Icon";
import { ScrollReveal } from "./ScrollReveal";
import { SectionCTA } from "./SectionCTA";
import styles from "./RajaProductSection.module.css";

const blockIcons: IconName[] = ["compass", "shield", "spark", "globe"];

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
          <p className={styles.openingLine}>{raja.openingLine}</p>
        </ScrollReveal>

        <div className={styles.blocks}>
          {raja.blocks.map((block, i) => (
            <article
              key={i}
              className={styles.block}
              data-index={i}
              style={{ "--block-index": i } as React.CSSProperties}
            >
              <div className={styles.blockMeta}>
                <span className={styles.blockIcon} aria-hidden="true">
                  <Icon name={blockIcons[i] ?? "spark"} size={22} />
                </span>
                <span className={styles.blockNumber} aria-hidden="true">
                  0{i + 1}
                </span>
                <span className={styles.blockTag}>{block.tag}</span>
              </div>
              <div>
                <h3 className={styles.blockTitle}>{block.title}</h3>
                <p className={styles.blockBody}>{block.body}</p>
              </div>
            </article>
          ))}
        </div>

        <SectionCTA text={raja.ctaText} href={checkoutHref} />
      </div>
    </section>
  );
}
