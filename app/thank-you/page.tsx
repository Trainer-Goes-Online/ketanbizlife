import type { Metadata } from "next";
import Link from "next/link";
import { clientConfig } from "@/client.config";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "You're In — See You Sunday",
  description:
    "Your seat is reserved for the Indian Export Insider Workshop. WhatsApp confirmation + Zoom link details on this page.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouPage() {
  const community = clientConfig.community.whatsappGroupUrl;

  return (
    <div className={styles.page}>
      <div className={`container-narrow ${styles.inner}`}>
        <div className={styles.iconWrap}>
          <span className={styles.checkmark} aria-hidden="true">
            ✓
          </span>
        </div>

        <h1 className={styles.heading}>You&apos;re in.</h1>

        <p className={styles.lead}>
          Your seat for the Indian Export Insider Workshop is reserved.
        </p>

        <div className={styles.eventCard}>
          <div className={styles.eventRow}>
            <span className={styles.eventKey}>Date</span>
            <span className={styles.eventValue}>
              {clientConfig.event.dateLabel}
            </span>
          </div>
          <div className={styles.eventRow}>
            <span className={styles.eventKey}>Time</span>
            <span className={styles.eventValue}>
              {clientConfig.event.timeLabel}
            </span>
          </div>
          <div className={styles.eventRow}>
            <span className={styles.eventKey}>Venue</span>
            <span className={styles.eventValue}>
              {clientConfig.event.platform}
            </span>
          </div>
          <div className={styles.eventRow}>
            <span className={styles.eventKey}>Language</span>
            <span className={styles.eventValue}>
              {clientConfig.event.language}
            </span>
          </div>
        </div>

        <h2 className={styles.nextHeading}>Next steps</h2>
        <ol className={styles.steps}>
          <li>
            <strong>Save the date.</strong> Block 3 hours on Sunday morning.
            10:45 AM to 1:45 PM IST. Don&apos;t schedule anything else.
          </li>
          <li>
            <strong>Check your WhatsApp.</strong> Confirmation message + Zoom
            link will reach the number you used at checkout. If not received
            in 5 minutes, check spam / sender request approvals.
          </li>
          <li>
            <strong>Bring a notebook.</strong> Hour 2 (Raja Product framework)
            and Hour 4 (live Q&amp;A) are where you&apos;ll need to write things
            down — specific to your product and country.
          </li>
          <li>
            <strong>Camera optional.</strong> Hindi me hoga. Aao seedha join karo.
          </li>
        </ol>

        {community ? (
          <div className={styles.communityCard}>
            <h3 className={styles.communityHeading}>
              Join the WhatsApp community
            </h3>
            <p className={styles.communityBody}>
              Pre-webinar warmup, agenda reminders, and live Q&amp;A queue
              starts here. Optional, but recommended.
            </p>
            <Link
              href={community}
              className={styles.communityCta}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join the WhatsApp group →
            </Link>
          </div>
        ) : (
          <div className={styles.communityFallback}>
            <p>{clientConfig.community.fallbackMessage}</p>
          </div>
        )}

        <p className={styles.signoff}>
          See you Sunday. — Ketan
        </p>
      </div>
    </div>
  );
}
