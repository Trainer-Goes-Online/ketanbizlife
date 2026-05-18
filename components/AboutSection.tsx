import type { ClientConfig } from "@/client.config";
import { AboutVisual } from "./AboutVisual";
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

          <ScrollReveal delay={0.18} from="right">
            <figure className={styles.visualFigure}>
              <div className={styles.visualFrame}>
                <AboutVisual />
              </div>
              <figcaption className={styles.visualCaption}>
                {about.visualCaption}
              </figcaption>
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
