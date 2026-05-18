import Image from "next/image";
import type { ClientConfig } from "@/client.config";
import { CredentialsMarquee } from "./CredentialsMarquee";
import { ScrollReveal } from "./ScrollReveal";
import { StatStrip } from "./StatStrip";
import styles from "./AboutSection.module.css";

interface Props {
  about: ClientConfig["about"];
  hiddenStatIndices?: number[];
}

export function AboutSection({ about, hiddenStatIndices }: Props) {
  // Split body on blank line so we can render distinct paragraphs.
  const paragraphs = about.body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section className={`light ${styles.section}`} aria-labelledby="about-heading">
      <div className="container">
        <ScrollReveal>
          <p className={styles.eyebrow}>{about.eyebrow}</p>
          <h2 id="about-heading" className={styles.heading}>
            {about.headline}
          </h2>
        </ScrollReveal>

        <div className={styles.split}>
          <ScrollReveal delay={0.1} from="left">
            <div className={styles.body}>
              {paragraphs.map((p, i) => (
                <p key={i} className={styles.paragraph}>
                  {p}
                </p>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal
            delay={0.18}
            from="right"
            className={styles.visualSlot}
          >
            <figure className={styles.visualFigure}>
              <div className={styles.visualFrame}>
                <Image
                  src="/About-Ketan.jpeg"
                  alt="Ketan Vadariya"
                  fill
                  sizes="(min-width: 1024px) 480px, (min-width: 640px) 50vw, 100vw"
                  className={styles.visualImage}
                />
                <div className={styles.visualOverlay} aria-hidden="true" />
                <figcaption className={styles.visualCaption}>
                  <span className={styles.visualName}>KETAN VADARIYA</span>
                  <span className={styles.visualRole}>
                    EXPORT MENTOR · 10+ YEARS
                  </span>
                </figcaption>
              </div>
            </figure>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.1}>
          <div className={styles.stats}>
            <StatStrip stats={about.stats} hiddenIndices={hiddenStatIndices} />
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={0.1}>
        <div className={styles.marquee}>
          <CredentialsMarquee items={about.marqueeItems} />
        </div>
      </ScrollReveal>
    </section>
  );
}
