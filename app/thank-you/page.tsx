import type { Metadata } from "next";
import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { Icon } from "@/components/Icon";
import { clientConfig } from "@/client.config";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "You're In — See You Sunday",
  description:
    "Your seat is reserved for the Indian Export Insider Workshop. Zoom link, calendar invite, and next steps inside.",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Builds a Google Calendar "Add Event" URL.
 * Reads the webinar start time + duration from clientConfig (env-driven).
 */
function buildGoogleCalendarUrl(): string {
  const start = new Date(clientConfig.event.countdownTargetISO);
  const end = new Date(
    start.getTime() + clientConfig.event.durationMinutes * 60 * 1000,
  );

  // Format: YYYYMMDDTHHmmssZ (Google accepts UTC stamps)
  const fmt = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "Indian Export Insider Workshop — Ketan BizLife",
    dates: `${fmt(start)}/${fmt(end)}`,
    details:
      "Live 3-hour webinar on the system Ketan uses across 2 export brands to find genuine international buyers. The Zoom link arrives on WhatsApp 30 minutes before the start time.",
    location: "Live on Zoom (link via WhatsApp)",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function ThankYouPage() {
  const community = clientConfig.community.whatsappGroupUrl;
  const calendarUrl = buildGoogleCalendarUrl();

  const infoCards = [
    {
      icon: "calendar" as const,
      label: "Date",
      value: clientConfig.event.dateLabel,
    },
    {
      icon: "clock" as const,
      label: "Time",
      value: clientConfig.event.timeLabel,
    },
    {
      icon: "video" as const,
      label: "Venue",
      value: clientConfig.event.platform,
    },
    {
      icon: "globe" as const,
      label: "Language",
      value: clientConfig.event.language,
    },
  ];

  const nextSteps = [
    {
      icon: "calendar" as const,
      title: "Save the date",
      body: "Block 3 hours on Sunday morning. Add the workshop to your calendar with one tap below.",
    },
    {
      icon: "message" as const,
      title: "Check WhatsApp",
      body: "Confirmation arrives at the number you used at checkout. The Zoom link reaches you 30 minutes before the session.",
    },
    {
      icon: "lightbulb" as const,
      title: "Bring a notebook",
      body: "The framework walkthrough and the live Q&A are where you'll want to write things down — specific to your product and country.",
    },
    {
      icon: "user" as const,
      title: "Camera optional",
      body: "Hindi me hoga. Camera off is fine. Just join and listen.",
    },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.topNav}>
        <Link href={`/${clientConfig.funnel.slug}`} className={styles.back}>
          <span aria-hidden="true">←</span>
          <span>Back to home</span>
        </Link>
        <span className={styles.brandMark}>KETAN BIZLIFE</span>
      </header>

      {/* ============= Hero: big celebration + countdown (dark) ============= */}
      <section className={styles.heroBlock}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={`container-narrow ${styles.heroInner}`}>
          <div className={styles.checkBadge} aria-hidden="true">
            <Icon name="check" size={40} />
            <span className={styles.checkRing} />
            <span className={styles.checkRingTwo} />
          </div>

          <p className={styles.eyebrow}>Registration confirmed</p>
          <h1 className={styles.heading}>You&apos;re in.</h1>
          <p className={styles.lead}>
            Your seat for the Indian Export Insider Workshop is reserved.
            Welcome to the team that doesn&apos;t play the wrong game anymore.
          </p>

          <div className={styles.countdownCard}>
            <Countdown
              targetISO={clientConfig.event.countdownTargetISO}
              label="Webinar starts in"
            />
          </div>
        </div>
      </section>

      {/* ============= Event details + add-to-calendar (light) ============= */}
      <section className={`light ${styles.detailsBlock}`}>
        <div className={`container-narrow ${styles.detailsInner}`}>
          <div className={styles.detailsHeader}>
            <h2 className={styles.detailsHeading}>Event details</h2>
            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.calendarCta}
            >
              <span className={styles.calendarIcon} aria-hidden="true">
                <Icon name="calendar" size={16} />
              </span>
              <span>Add to Google Calendar</span>
            </a>
          </div>

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
        </div>
      </section>

      {/* ============= Next steps (light) ============= */}
      <section className={`light ${styles.stepsBlock}`}>
        <div className={`container-narrow ${styles.stepsInner}`}>
          <h2 className={styles.stepsHeading}>What happens next</h2>
          <ol className={styles.steps}>
            {nextSteps.map((step, i) => (
              <li key={i} className={styles.step}>
                <span className={styles.stepIndex} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className={styles.stepBody}>
                  <div className={styles.stepTitleRow}>
                    <span className={styles.stepIcon} aria-hidden="true">
                      <Icon name={step.icon} size={16} />
                    </span>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                  </div>
                  <p className={styles.stepText}>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============= Community CTA (dark) ============= */}
      {community ? (
        <section className={styles.communityBlock}>
          <div className={`container-narrow ${styles.communityInner}`}>
            <div className={styles.communityCard}>
              <span className={styles.communityIcon} aria-hidden="true">
                <Icon name="message" size={22} />
              </span>
              <div className={styles.communityCopy}>
                <h2 className={styles.communityHeading}>
                  Join the WhatsApp community
                </h2>
                <p className={styles.communityBody}>
                  Pre-webinar warmup, agenda reminders, and live Q&amp;A queue
                  start here. Optional but recommended.
                </p>
              </div>
              <Link
                href={community}
                className={styles.communityCta}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Join the group</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className={styles.communityBlock}>
          <div className={`container-narrow ${styles.communityInner}`}>
            <div className={styles.communityFallback}>
              <p>{clientConfig.community.fallbackMessage}</p>
            </div>
          </div>
        </section>
      )}

      {/* ============= Signoff (light) ============= */}
      <section className={`light ${styles.signoffBlock}`}>
        <div className={`container-narrow ${styles.signoffInner}`}>
          <p className={styles.signoff}>See you Sunday.</p>
          <p className={styles.signoffName}>— Ketan</p>
        </div>
      </section>
    </div>
  );
}
