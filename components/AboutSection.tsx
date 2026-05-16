import type { ClientConfig } from "@/client.config";
import { CredentialsMarquee } from "./CredentialsMarquee";
import { ScrollReveal } from "./ScrollReveal";
import { StatStrip } from "./StatStrip";
import { VideoTestimonial } from "./VideoTestimonial";
import styles from "./AboutSection.module.css";

interface Props {
  about: ClientConfig["about"];
  hiddenStatIndices?: number[];
}

export function AboutSection({ about, hiddenStatIndices }: Props) {
  return (
    <section className={styles.section} aria-labelledby="about-heading">
      <div className="container">
        <ScrollReveal>
          <p className={styles.eyebrow}>{about.eyebrow}</p>
          <h2 id="about-heading" className={styles.heading}>
            {about.headline}
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className={styles.stats}>
            <StatStrip stats={about.stats} hiddenIndices={hiddenStatIndices} />
          </div>
        </ScrollReveal>

        <div className={styles.acts}>
          {about.acts.map((act, i) => (
            <ScrollReveal key={act.number} delay={0.1 + i * 0.08}>
              <article className={styles.act}>
                <div className={styles.actMeta}>
                  <span className={styles.actLabel}>{act.label}</span>
                </div>
                <h3 className={styles.actTitle}>{act.title}</h3>
                <p className={styles.actBody}>{act.body}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <ScrollReveal delay={0.1}>
        <div className={styles.marquee}>
          <CredentialsMarquee items={about.marqueeItems} />
        </div>
      </ScrollReveal>

      <div className="container">
        <ScrollReveal>
          <h3 className={styles.videoHeading}>{about.videoSectionHeading}</h3>
        </ScrollReveal>

        <div className={styles.videos}>
          {about.videos.map((video, i) => (
            <ScrollReveal key={video.id} delay={0.1 + i * 0.1}>
              <VideoTestimonial
                youtubeId={video.youtubeId}
                title={video.title}
                thumbnail={video.thumbnail}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
