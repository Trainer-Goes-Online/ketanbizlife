import type { ClientConfig } from "@/client.config";
import { ScrollReveal } from "./ScrollReveal";
import { VideoTestimonial } from "./VideoTestimonial";
import styles from "./TestimonialsSection.module.css";

interface Props {
  testimonials: ClientConfig["testimonials"];
}

export function TestimonialsSection({ testimonials }: Props) {
  return (
    <section
      className={`alt ${styles.section}`}
      aria-labelledby="testimonials-heading"
    >
      <div className="container">
        <ScrollReveal>
          <h2 id="testimonials-heading" className={styles.heading}>
            {testimonials.heading}
          </h2>
        </ScrollReveal>

        <div className={styles.grid}>
          {testimonials.videos.map((video, i) => (
            <ScrollReveal key={video.id} delay={0.06 + i * 0.05}>
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
