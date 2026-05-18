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
 * Fetches Wistia metadata once and extracts:
 *  - thumbnail: sharp 9:16 first-frame still (assets[type=still_image])
 *  - mp4Url:    direct MP4 hotlink (assets[type=md_mp4_video] preferred)
 *
 * The MP4 URL drives the <video> element in VideoTestimonial, which is
 * the only reliable autoplay mechanism on mobile Safari (the iframe
 * embed loses the user-gesture context by the time Wistia's internal
 * player.js calls .play()).
 *
 * Cached at the Next data layer for 24h. Falls back to the low-res
 * swatch + no MP4 (which forces the iframe fallback path in the
 * component) if Wistia's metadata call fails.
 */
async function getWistiaAssets(
  wistiaId: string,
): Promise<{ thumbnail: string; mp4Url?: string }> {
  const fallbackThumb = `https://fast.wistia.com/embed/medias/${wistiaId}/swatch`;
  if (!wistiaId) return { thumbnail: fallbackThumb };
  try {
    const res = await fetch(
      `https://fast.wistia.net/embed/medias/${wistiaId}.json`,
      { next: { revalidate: 60 * 60 * 24 } },
    );
    if (!res.ok) return { thumbnail: fallbackThumb };
    const data = (await res.json()) as WistiaMediaJson;
    const assets = data.media?.assets ?? [];

    // ---- Thumbnail ----
    const stillAsset = assets.find(
      (a) => a.type === "still_image" && a.url,
    );
    const baseUrl = stillAsset?.url ?? data.media?.thumbnailUrl;
    let thumbnail = fallbackThumb;
    if (baseUrl) {
      const asJpg = baseUrl.replace(/\.bin(\?|$)/, ".jpg$1");
      try {
        const url = new URL(asJpg);
        url.searchParams.set("image_crop_resized", "720x1280");
        thumbnail = url.toString();
      } catch {
        thumbnail = asJpg;
      }
    }

    // ---- MP4 URL ----
    // Quality order: md (540x960, ~5MB) → iphone (360x640, ~3MB) → hd
    // (720x1280, ~9MB) → original → mp4 (last-resort 240p).
    // Md is the best size/quality tradeoff for our 9:16 modal player
    // since 99% of viewers are on mobile data.
    const mp4Priority = [
      "md_mp4_video",
      "iphone_video",
      "hd_mp4_video",
      "original",
      "mp4_video",
    ];
    let mp4Url: string | undefined;
    for (const type of mp4Priority) {
      const asset = assets.find((a) => a.type === type && a.url);
      if (asset?.url) {
        mp4Url = asset.url;
        break;
      }
    }

    return { thumbnail, mp4Url };
  } catch {
    return { thumbnail: fallbackThumb };
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
  const videosWithAssets = await Promise.all(
    testimonials.videos.map(async (video) => {
      let thumbnail = "";
      let mp4Url: string | undefined;
      if (video.wistiaId) {
        const assets = await getWistiaAssets(video.wistiaId);
        thumbnail = assets.thumbnail;
        mp4Url = assets.mp4Url;
      } else if (video.vimeoId) {
        thumbnail = await getVimeoThumbnail(video.vimeoId);
      }
      return { ...video, thumbnail, mp4Url };
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
          {videosWithAssets.map((video, i) => (
            <ScrollReveal
              key={video.id}
              delay={0.06 + i * 0.05}
              className={video.mobileOnly ? styles.mobileOnly : undefined}
            >
              <VideoTestimonial
                wistiaId={video.wistiaId}
                vimeoId={video.vimeoId}
                mp4Url={video.mp4Url}
                thumbnail={video.thumbnail}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
