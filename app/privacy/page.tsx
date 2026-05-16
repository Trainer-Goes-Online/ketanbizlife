import type { Metadata } from "next";
import Link from "next/link";
import { clientConfig } from "@/client.config";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${clientConfig.brand.name}.`,
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href={`/${clientConfig.funnel.slug}`} className={styles.back}>
          ← Back to home
        </Link>
      </header>

      <article className={`container-narrow ${styles.article}`}>
        <h1>Privacy Policy</h1>
        <p className={styles.updated}>Last updated: May 16, 2026</p>

        <p>
          {clientConfig.brand.name} (&ldquo;we&rdquo;, &ldquo;our&rdquo;) operates{" "}
          {clientConfig.brand.domain} (the &ldquo;Site&rdquo;) and the
          associated webinar registration funnel. This policy explains what
          information we collect, how we use it, and the choices you have.
        </p>

        <h2>Information we collect</h2>
        <p>
          When you register for a webinar, we collect: first name, last name,
          email, phone number with country code, city, and standard UTM tracking
          parameters from your visit. We also collect the payment ID, order ID,
          and amount from Razorpay after a successful transaction. We do not
          collect or store card details — Razorpay handles payment information
          directly per PCI DSS standards.
        </p>

        <h2>How we use information</h2>
        <ul>
          <li>To deliver the webinar (Zoom link, reminders) via WhatsApp / email</li>
          <li>To send relevant follow-up content and post-webinar materials</li>
          <li>To improve our advertising via Meta Conversions API (hashed data only)</li>
          <li>To analyze site usage via Google Analytics and Microsoft Clarity (anonymized)</li>
        </ul>

        <h2>Sharing</h2>
        <p>
          We do not sell your data. We share data with these processors only:
          Razorpay (payments), Pabbly Connect (automation routing to our CRM and
          WhatsApp delivery), Meta (hashed identifiers for ad attribution),
          Google Analytics, and Microsoft Clarity.
        </p>

        <h2>Your rights</h2>
        <p>
          You can request access, correction, or deletion of your data at any
          time by emailing us. We respond within 30 days.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy questions, contact us at{" "}
          <a href="mailto:support@ketanbizlife.com">support@ketanbizlife.com</a>.
        </p>
      </article>
    </div>
  );
}
