import type { Metadata } from "next";
import Link from "next/link";
import { BonusesSection } from "@/components/BonusesSection";
import { CheckoutForm } from "@/components/CheckoutForm";
import { FooterMini } from "@/components/FooterMini";
import { Icon } from "@/components/Icon";
import { UtmTracker } from "@/components/UtmTracker";
import { clientConfig } from "@/client.config";
import { getCashfreeMode } from "@/lib/cashfree";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Reserve Your ₹99 Seat — Ketan BizLife",
  description:
    "Complete your registration for the Indian Export Insider Workshop — live 3-hour webinar with Ketan, Sunday 31st May 2026 at 10:45 AM IST.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  const cashfreeMode = getCashfreeMode();

  return (
    <div className={styles.page}>
      <UtmTracker storageKey={clientConfig.funnel.sessionStorageKey} />

      <header className={styles.topNav}>
        <Link href={`/${clientConfig.funnel.slug}`} className={styles.back}>
          <span aria-hidden="true">←</span>
          <span>Back to webinar</span>
        </Link>
        <span className={styles.brandMark}>KETAN BIZLIFE</span>
      </header>

      {/* ====== Compact dark header ====== */}
      <section className={`${styles.section} ${styles.headerBlock}`}>
        <div className="container">
          <div className={styles.headerInner}>
            <div className={styles.headerCopy}>
              <p className={styles.eyebrow}>Reserve your seat</p>
              <h1 className={styles.productTitle}>
                {clientConfig.checkout.productTitle}
              </h1>
              <p className={styles.productMeta}>
                {clientConfig.checkout.productMeta}
              </p>
            </div>

            <div className={styles.headerPrice}>
              <span className={styles.priceAnchor}>
                {clientConfig.hero.priceAnchor}
              </span>
              <span className={styles.priceArrow} aria-hidden="true">
                →
              </span>
              <span className={styles.priceActual}>
                {clientConfig.hero.priceActual}
              </span>
              <span className={styles.priceMeta}>today only</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====== FORM (priority section, light) ====== */}
      <section className={`light ${styles.section} ${styles.checkoutBlock}`}>
        <div className="container">
          <div className={styles.checkoutGrid}>
            <div className={styles.checkoutMain}>
              <h2 className={styles.formHeading}>Complete your registration</h2>
              <p className={styles.formSubheading}>
                Takes 30 seconds. Zoom link reaches you on WhatsApp 30 minutes
                before the live session.
              </p>

              <CheckoutForm config={clientConfig} mode={cashfreeMode} />
            </div>

            <aside
              className={styles.checkoutAside}
              aria-label="What's included"
            >
              <h3 className={styles.asideHeading}>
                <Icon name="package" size={18} />
                <span>Inside Your ₹99</span>
              </h3>

              <ul className={styles.asideList}>
                <li>3 hours live with Ketan</li>
                <li>2 proven buyer-finding systems</li>
                <li>Buyer communication frameworks</li>
                <li>Country-specific follow-up approach</li>
                <li>Live Q&amp;A with your product</li>
                <li>1-Year recording access</li>
                <li>5 free bonuses (₹2,000+ value)</li>
              </ul>

              <div className={styles.asideEvent}>
                <div className={styles.asideEventLabel}>Live event</div>
                <div className={styles.asideEventDetail}>
                  {clientConfig.event.dateLabel}
                </div>
                <div className={styles.asideEventDetail}>
                  {clientConfig.event.timeLabel}
                </div>
                <div className={styles.asideEventDetail}>
                  {clientConfig.event.platform} · Hindi
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ====== Bonuses — reuses the landing-page BonusesSection for visual consistency ====== */}
      <BonusesSection bonuses={clientConfig.bonuses} />

      {/* ====== Money-back guarantee (light, compact) ====== */}
      <section className={`light ${styles.section} ${styles.guaranteeBlock}`}>
        <div className="container-narrow">
          <div className={styles.guaranteeCard}>
            <span className={styles.guaranteeBadge}>
              <span className={styles.guaranteeShield} aria-hidden="true">
                <Icon name="shield" size={18} />
              </span>
              100% Money-Back Guarantee
            </span>

            <h2 className={styles.guaranteeHeading}>
              ₹99 Try Karo. Value Nahi Mili? ₹99 Wapas.
            </h2>

            <p className={styles.guaranteeBody}>
              Sunday ko webinar attend karo. Pura 3 ghante dekho. Agar value
              nahi mili, WhatsApp pe ek message bhejo. ₹99 wapas. Bina koi
              sawaal.
            </p>
          </div>
        </div>
      </section>

      <FooterMini brand={clientConfig.brand} footer={clientConfig.footer} />
    </div>
  );
}
