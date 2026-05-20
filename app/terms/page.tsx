import type { Metadata } from "next";
import Link from "next/link";
import { FooterMini } from "@/components/FooterMini";
import { Icon, type IconName } from "@/components/Icon";
import { clientConfig } from "@/client.config";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `Terms and conditions for ${clientConfig.brand.name} webinar registrations.`,
  robots: { index: true, follow: true },
};

interface Section {
  icon: IconName;
  title: string;
  body: React.ReactNode;
  id?: string;
}

export default function TermsPage() {
  const sections: Section[] = [
    {
      icon: "check",
      title: "1. Registration",
      body: (
        <p>
          By completing payment, you reserve a single seat for the live webinar
          you registered for. Seats are non-transferable. The Zoom link is sent
          to the WhatsApp number you provided 30 minutes before the webinar
          start time.
        </p>
      ),
    },
    {
      icon: "video",
      title: "2. Live event",
      body: (
        <p>
          The webinar is delivered live in Hindi via Zoom for the scheduled
          duration. A 1-year recording access is included as part of the
          registration.
        </p>
      ),
    },
    {
      id: "refund",
      icon: "refresh",
      title: "3. Refund policy",
      body: (
        <>
          <p>
            <strong>100% Money-Back Guarantee.</strong> Attend the live webinar,
            watch the full session. If, by Sunday evening, you feel the content
            did not deliver value, message us on WhatsApp at the support number
            shared in your welcome message and we will refund the ₹99 paid in
            full within 7&ndash;10 business days.
          </p>
          <p>
            No paperwork, no questions asked. This guarantee applies to the
            base ₹99 registration only — any optional add-on toolkits are
            final once purchased. For the full policy, see the{" "}
            <Link href="/refund">Refund Policy</Link>.
          </p>
        </>
      ),
    },
    {
      icon: "info",
      title: "4. No income guarantee",
      body: (
        <p>
          We teach a framework and a system for finding international export
          buyers. Outcomes — including international orders, revenue, and
          margin improvement — depend on your consistent application of the
          system, your product category, market conditions, and many other
          factors outside our control. We make no guarantee of specific income
          or business outcomes.
        </p>
      ),
    },
    {
      icon: "lock",
      title: "5. Intellectual property",
      body: (
        <p>
          The frameworks, scripts, agendas, and any materials shared during the
          webinar and inside the bonus toolkits are the intellectual property
          of {clientConfig.brand.name}. You may apply them in your own
          business but may not redistribute, republish, or resell them.
        </p>
      ),
    },
    {
      icon: "shield",
      title: "6. Privacy",
      body: (
        <p>
          Our handling of your personal data is covered in the{" "}
          <Link href="/privacy">Privacy Policy</Link>. Payments are processed
          by Cashfree under PCI DSS standards; we do not store card data.
        </p>
      ),
    },
    {
      icon: "file-text",
      title: "7. Changes to these terms",
      body: (
        <p>
          We may update these terms from time to time. Material changes will be
          communicated to registered participants by email. Continued use of
          the service after such updates constitutes acceptance.
        </p>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.topNav}>
        <Link href={`/${clientConfig.funnel.slug}`} className={styles.back}>
          <span aria-hidden="true">←</span>
          <span>Back to webinar</span>
        </Link>
        <span className={styles.brandMark}>KETAN BIZLIFE</span>
      </header>

      {/* ============= Hero (dark) ============= */}
      <section className={styles.heroBlock}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={`container-narrow ${styles.heroInner}`}>
          <div className={styles.heroBadge} aria-hidden="true">
            <Icon name="scale-balance" size={32} />
            <span className={styles.heroBadgeRing} />
            <span className={styles.heroBadgeRingTwo} />
          </div>

          <span className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowDot} aria-hidden="true" />
            Legal · Terms
          </span>

          <h1 className={styles.heroTitle}>Terms &amp; Conditions</h1>

          <p className={styles.heroSub}>
            The rules that govern your registration and participation in
            webinars and workshops by {clientConfig.brand.name}.
          </p>

          <p className={styles.heroMeta}>
            <span>Last updated</span>
            <span className={styles.heroMetaDot} aria-hidden="true" />
            <span>May 16, 2026</span>
          </p>
        </div>
      </section>

      {/* ============= Body (light) ============= */}
      <section className={`light ${styles.bodyBlock}`}>
        <div className={`container-narrow ${styles.bodyInner}`}>
          <div className={styles.intro}>
            <p>
              These terms govern your registration and participation in
              webinars and workshops offered by{" "}
              <strong>{clientConfig.brand.name}</strong> (&ldquo;we&rdquo;,
              &ldquo;our&rdquo;). By completing checkout you confirm that you
              have read and agree to these terms.
            </p>
          </div>

          <div className={styles.sections}>
            {sections.map((s) => (
              <article
                key={s.title}
                id={s.id}
                className={styles.section}
              >
                <span className={styles.sectionIcon} aria-hidden="true">
                  <Icon name={s.icon} size={22} />
                </span>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>{s.title}</h2>
                </div>
                <div className={styles.sectionBody}>{s.body}</div>
              </article>
            ))}
          </div>

          <div className={styles.contact}>
            <span className={styles.contactIcon} aria-hidden="true">
              <Icon name="mail" size={24} />
            </span>
            <div>
              <h3 className={styles.contactTitle}>Questions about the terms?</h3>
              <p className={styles.contactBody}>
                Email{" "}
                <a href="mailto:support@ketanbizlife.com">
                  support@ketanbizlife.com
                </a>{" "}
                — we&apos;ll get back within one business day.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FooterMini brand={clientConfig.brand} footer={clientConfig.footer} />
    </div>
  );
}
