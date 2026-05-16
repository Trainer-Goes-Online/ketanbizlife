import type { Metadata } from "next";
import Link from "next/link";
import { clientConfig } from "@/client.config";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `Terms and conditions for ${clientConfig.brand.name} webinar registrations.`,
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href={`/${clientConfig.funnel.slug}`} className={styles.back}>
          ← Back to home
        </Link>
      </header>

      <article className={`container-narrow ${styles.article}`}>
        <h1>Terms &amp; Conditions</h1>
        <p className={styles.updated}>Last updated: May 16, 2026</p>

        <p>
          These terms govern your registration and participation in webinars
          and workshops offered by {clientConfig.brand.name} (&ldquo;we&rdquo;,
          &ldquo;our&rdquo;).
        </p>

        <h2>1. Registration</h2>
        <p>
          By completing payment, you reserve a single seat for the live webinar
          you registered for. Seats are non-transferable. The Zoom link is sent
          to the WhatsApp number you provided 30 minutes before the webinar
          start time.
        </p>

        <h2>2. Live event</h2>
        <p>
          The webinar is delivered live in Hindi via Zoom for the scheduled
          duration. Recording is not provided to registered participants — the
          format is deliberately live-only to preserve the interactive value of
          Hour 2 (live product walkthrough) and the final Q&amp;A.
        </p>

        <h2 id="refund">3. Refund policy</h2>
        <p>
          {clientConfig.approvalItems.showRefundLine
            ? "If, within the first 30 minutes of the live webinar, you find the content does not match what was promised on the landing page, email us at support@ketanbizlife.com from the registered email address within 24 hours of the webinar's end and we will refund the ₹99 paid in full within 7-10 business days."
            : "All registrations are final. The ₹99 fee covers seat reservation, webinar delivery, and the live Q&A. No refunds are issued after registration."}
        </p>

        <h2>4. No income guarantee</h2>
        <p>
          We teach a framework and a system for finding international export
          buyers. Outcomes — including international orders, revenue, and
          margin improvement — depend on your consistent application of the
          system, your product category, market conditions, and many other
          factors outside our control. We make no guarantee of specific income
          or business outcomes.
        </p>

        <h2>5. Intellectual property</h2>
        <p>
          The Raja Product framework, scripts, agendas, and any materials
          shared during the webinar are the intellectual property of{" "}
          {clientConfig.brand.name}. You may apply them in your own business
          but may not redistribute, republish, or sell them.
        </p>

        <h2>6. Privacy</h2>
        <p>
          Our handling of your personal data is covered in the{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>

        <h2>7. Changes</h2>
        <p>
          We may update these terms from time to time. Material changes will be
          communicated to registered participants by email.
        </p>

        <h2>Contact</h2>
        <p>
          Email{" "}
          <a href="mailto:support@ketanbizlife.com">
            support@ketanbizlife.com
          </a>{" "}
          with any questions about these terms.
        </p>
      </article>
    </div>
  );
}
