import Image from "next/image";
import type { ClientConfig } from "@/client.config";
import { CTAButton } from "./CTAButton";
import { Countdown } from "./Countdown";
import { HindiBanner } from "./HindiBanner";
import { Icon, type IconName } from "./Icon";
import { MastheadMarquee } from "./MastheadMarquee";
import { TrustLine } from "./TrustLine";
import styles from "./Hero.module.css";

interface Props {
  hero: ClientConfig["hero"];
  event: ClientConfig["event"];
  checkoutHref: string;
  /** Reserved for backward compatibility — refund line now always rendered as a separate guarantee line. */
  showRefundLine: boolean;
}

const mastheadItems = [
  "Ketan BizLife · Issue 03",
  "For Indian Manufacturers, Traders & Sourcing Agents Doing Goods Export",
  "The Indian Export Insider Workshop",
  "Live · Sunday 31st May 2026 · 10:45 AM IST",
  "Hindi · Zoom · 3 Hours · ₹99 entry",
];

interface InfoCard {
  icon: IconName;
  label: string;
  value: string;
}

export function Hero({ hero, event, checkoutHref }: Props) {
  const infoCards: InfoCard[] = [
    { icon: "calendar", label: "Date", value: "Sunday, 31st May" },
    { icon: "clock", label: "Time", value: event.timeLabel },
    { icon: "video", label: "Venue", value: "Live on Zoom" },
    { icon: "user", label: "Host", value: "Ketan Vadariya" },
  ];

  return (
    <>
      <MastheadMarquee items={mastheadItems} />

      <header id="hero" className={styles.hero}>
        <div className={styles.bg} aria-hidden="true">
          <div className={styles.gridGlow} />
        </div>
        <div className={styles.drift} aria-hidden="true" />

        <div className={styles.split}>
          {/* Top of copy column — Hindi banner + headline only. */}
          <div className={styles.copyTop}>
            <HindiBanner text={hero.hindiBanner} />

            <h1 className={styles.headline}>
              <span className={styles.headlineLead}>{hero.headlineLead}</span>
              {hero.headlinePunchLines.map((line, i) => (
                <span key={i} className={styles.headlinePunch}>
                  {line}
                </span>
              ))}
            </h1>
          </div>

          {/* Portrait card — solo on the right column at desktop, between
              headline and info grid on mobile. */}
          <figure className={styles.portraitCard}>
            <div className={styles.portraitTopRow}>
              <span className={styles.portraitBrand}>KETAN BIZLIFE</span>
              <span className={styles.portraitLive}>
                <span
                  className={styles.portraitLiveDot}
                  aria-hidden="true"
                />
                LIVE
              </span>
            </div>

            <p className={styles.portraitTagline}>
              Every Indian Exporter Who Cracked Their First International
              Order Had a System. Do You?
            </p>

            <div className={styles.portraitImageFrame}>
              <Image
                src="/ketan-hero.jpeg"
                alt="Ketan Vadariya, Export Mentor"
                fill
                priority
                sizes="(min-width: 1024px) 480px, 100vw"
                className={styles.portraitImage}
              />
              <div
                className={styles.portraitImageVignette}
                aria-hidden="true"
              />
              <div
                className={styles.portraitImageBottom}
                aria-hidden="true"
              />

              <p className={styles.portraitOverlayText}>
                2 proven buyer-finding systems that can help you get genuine
                international orders.{" "}
                <em>
                  Wahi system jo Mein 10+ saal se 2 export brands ke saath
                  use kar raha hoon.
                </em>
              </p>

              <figcaption className={styles.portraitCaption}>
                <span className={styles.portraitName}>KETAN VADARIYA</span>
                <span className={styles.portraitRole}>
                  EXPORT MENTOR · 10+ YEARS
                </span>
              </figcaption>
            </div>
          </figure>

          {/* Info grid — mobile: immediately after portrait. Desktop: bottom of
              left column under the CTA. */}
          <div className={styles.infoGrid}>
            {infoCards.map((card) => (
              <div key={card.label} className={styles.infoCard}>
                <span className={styles.infoIcon} aria-hidden="true">
                  <Icon name={card.icon} size={18} />
                </span>
                <span className={styles.infoLabel}>{card.label}</span>
                <span className={styles.infoValue}>{card.value}</span>
              </div>
            ))}
          </div>

          {/* Stat block — sits between portrait and countdown on mobile flow.
              On desktop grid it occupies its own row in the left column. */}
          <div className={styles.stat}>
            <p className={styles.statHeadline}>{hero.statHeadline}</p>
            {hero.statLines.map((line, i) => (
              <p key={i} className={styles.statLine}>
                {line}
              </p>
            ))}
          </div>

          {/* Bottom of copy column — countdown + CTA. */}
          <div className={styles.copyBottom}>
            <div className={styles.countdownWrap}>
              <span className={styles.eventInLabel}>Event in</span>
              <Countdown
                targetISO={event.countdownTargetISO}
                label=""
              />
            </div>

            <div className={styles.ctaRow}>
              <CTAButton
                href={checkoutHref}
                variant="primary"
                size="large"
                withArrow
                ariaLabel={hero.primaryCtaText}
              >
                {hero.primaryCtaText}
              </CTAButton>
              <TrustLine text={hero.trustLine} refundLine={null} />
              <p className={styles.guaranteeLine}>
                <span className={styles.guaranteeCheck} aria-hidden="true">
                  <Icon name="shield" size={14} />
                </span>
                <span>
                  <strong>100% Money-Back Guarantee.</strong> ₹99 wapas even
                  after watching the entire webinar.
                </span>
              </p>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
