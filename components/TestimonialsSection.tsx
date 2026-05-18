import type { ClientConfig } from "@/client.config";
import { ScrollReveal } from "./ScrollReveal";
import { VideoTestimonial } from "./VideoTestimonial";
import styles from "./TestimonialsSection.module.css";

interface Props {
  testimonials: ClientConfig["testimonials"];
}

interface WistiaAsset {
  type?: string;
  url?: string;
}

interface WistiaMediaJson {
  media?: {
    thumbnailUrl?: string;
    assets?: WistiaAsset[];
  };
}

interface VimeoOembedJson {
  thumbnail_url?: string;
}

/**
 * Sharp 9:16 first-frame still from Wistia (assets[type=still_image]).
 * Falls back to the low-res swatch if metadata fetch fails. Cached 24h.
 */
async function getWistiaThumbnail(wistiaId: string): Promise<string> {
  const fallback = `https://fast.wistia.com/embed/medias/${wistiaId}/swatch`;
  if (!wistiaId) return fallback;
  try {
    const res = await fetch(
      `https://fast.wistia.net/embed/medias/${wistiaId}.json`,
      { next: { revalidate: 60 * 60 * 24 } },
    );
    if (!res.ok) return fallback;
    const data = (await res.json()) as WistiaMediaJson;

    const stillAsset = data.media?.assets?.find(
      (a) => a.type === "still_image" && a.url,
    );
    const baseUrl = stillAsset?.url ?? data.media?.thumbnailUrl;
    if (!baseUrl) return fallback;
    const asJpg = baseUrl.replace(/\.bin(\?|$)/, ".jpg$1");
    try {
      const url = new URL(asJpg);
      url.searchParams.set("image_crop_resized", "720x1280");
      return url.toString();
    } catch {
      return asJpg;
    }
  } catch {
    return fallback;
  }
}

/**
 * Vimeo thumbnail via the oEmbed endpoint. Requesting width=720&height=1280
 * yields the largest available still (Vimeo caps at ~640 wide). Cached 24h.
 */
async function getVimeoThumbnail(vimeoId: string): Promise<string> {
  if (!vimeoId) return "";
  try {
    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}&width=720&height=1280`,
      { next: { revalidate: 60 * 60 * 24 } },
    );
    if (!res.ok) return "";
    const data = (await res.json()) as VimeoOembedJson;
    return data.thumbnail_url ?? "";
  } catch {
    return "";
  }
}

export async function TestimonialsSection({ testimonials }: Props) {
  const videosWithThumbnails = await Promise.all(
    testimonials.videos.map(async (video) => {
      let thumbnail = "";
      if (video.wistiaId) {
        thumbnail = await getWistiaThumbnail(video.wistiaId);
      } else if (video.vimeoId) {
        thumbnail = await getVimeoThumbnail(video.vimeoId);
      }
      return { ...video, thumbnail };
    }),
  );

  return (
    <section
      className={`alt ${styles.section}`}
      aria-labelledby="testimonials-heading"
    >
      <div className="container">
        <ScrollReveal>
          <p className={styles.eyebrow}>{testimonials.eyebrow}</p>
          <h2 id="testimonials-heading" className={styles.heading}>
            {testimonials.heading}
          </h2>
        </ScrollReveal>

        <div className={styles.grid}>
          {videosWithThumbnails.map((video, i) => (
            <ScrollReveal
              key={video.id}
              delay={0.06 + i * 0.05}
              className={video.mobileOnly ? styles.mobileOnly : undefined}
            >
              <VideoTestimonial
                wistiaId={video.wistiaId}
                vimeoId={video.vimeoId}
                thumbnail={video.thumbnail}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
