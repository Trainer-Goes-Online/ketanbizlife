import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/CheckoutForm";
import { clientConfig } from "@/client.config";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Reserve Your ₹99 Seat",
  description:
    "Complete your registration for the Indian Export Insider Workshop — live 3-hour webinar with Ketan, this Sunday 10:45 AM IST.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href={`/${clientConfig.funnel.slug}`} className={styles.back}>
          ← Back to webinar details
        </Link>
      </header>

      <div className={`container ${styles.layout}`}>
        <section className={styles.formCol}>
          <h1 className={styles.heading}>
            Reserve your{" "}
            <span className={styles.price}>{clientConfig.hero.priceActual}</span>{" "}
            seat
          </h1>
          <p className={styles.sub}>
            Fill in your details. You&apos;ll get the Zoom link 30 minutes
            before the webinar on WhatsApp.
          </p>

          <CheckoutForm config={clientConfig} />
        </section>

        <aside className={styles.summary} aria-label="Order summary">
          <h2 className={styles.summaryHeading}>Order Summary</h2>

          <div className={styles.lineItem}>
            <span className={styles.itemName}>
              Indian Export Insider Workshop
            </span>
            <span className={styles.itemPrice}>
              <s className={styles.anchor}>{clientConfig.hero.priceAnchor}</s>{" "}
              <strong>{clientConfig.hero.priceActual}</strong>
            </span>
          </div>

          <ul className={styles.includes}>
            <li>3 hours live with Ketan</li>
            <li>Raja Product framework — live reveal</li>
            <li>2 proven buyer-finding systems</li>
            <li>Hour-by-hour structured agenda</li>
            <li>Live Q&amp;A — your product, your country</li>
            <li>Live Zoho CRM setup</li>
            <li>4 ready response scripts</li>
          </ul>

          <div className={styles.event}>
            <div className={styles.eventLabel}>Live event</div>
            <div className={styles.eventDetail}>{clientConfig.event.dateLabel}</div>
            <div className={styles.eventDetail}>{clientConfig.event.timeLabel}</div>
            <div className={styles.eventDetail}>{clientConfig.event.platform}</div>
            <div className={styles.eventDetail}>Hindi · Q&amp;A included</div>
          </div>

          <div className={styles.total}>
            <span>Total</span>
            <strong>{clientConfig.hero.priceActual}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
}
