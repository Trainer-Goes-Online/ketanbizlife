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
      <header className={styles.topNav}>
        <Link href={`/${clientConfig.funnel.slug}`} className={styles.back}>
          <span aria-hidden="true">←</span>
          <span>Back to webinar</span>
        </Link>
        <span className={styles.brandMark}>KETAN BIZLIFE</span>
      </header>

      <section className={`light ${styles.section}`}>
        <article className={`container-narrow ${styles.article}`}>
          <h1>Terms &amp; Conditions</h1>
          <p className={styles.updated}>Last updated: May 16, 2026</p>

          <p>
            These terms govern your registration and participation in webinars
            and workshops offered by {clientConfig.brand.name}{" "}
            (&ldquo;we&rdquo;, &ldquo;our&rdquo;).
          </p>

          <h2>1. Registration</h2>
          <p>
            By completing payment, you reserve a single seat for the live
            webinar you registered for. Seats are non-transferable. The Zoom
            link is sent to the WhatsApp number you provided 30 minutes before
            the webinar start time.
          </p>

          <h2>2. Live event</h2>
          <p>
            The webinar is delivered live in Hindi via Zoom for the scheduled
            duration. A 1-year recording access is included as part of the
            registration.
          </p>

          <h2 id="refund">3. Refund policy</h2>
          <p>
            100% Money-Back Guarantee. Attend the live webinar, watch the full
            session. If, by Sunday evening, you feel the content did not
            deliver value, message us on WhatsApp at the support number shared
            in your welcome message and we will refund the ₹99 paid in full
            within 7&ndash;10 business days. No paperwork, no questions asked.
            This guarantee applies to the base ₹99 registration only — any
            optional add-on toolkits are final once purchased.
          </p>

          <h2>4. No income guarantee</h2>
          <p>
            We teach a framework and a system for finding international export
            buyers. Outcomes — including international orders, revenue, and
            margin improvement — depend on your consistent application of the
            system, your product category, market conditions, and many other
            factors outside our control. We make no guarantee of specific
            income or business outcomes.
          </p>

          <h2>5. Intellectual property</h2>
          <p>
            The frameworks, scripts, agendas, and any materials shared during
            the webinar and inside the bonus toolkits are the intellectual
            property of {clientConfig.brand.name}. You may apply them in your
            own business but may not redistribute, republish, or resell them.
          </p>

          <h2>6. Privacy</h2>
          <p>
            Our handling of your personal data is covered in the{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>

          <h2>7. Changes</h2>
          <p>
            We may update these terms from time to time. Material changes will
            be communicated to registered participants by email.
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
      </section>
    </div>
  );
}
