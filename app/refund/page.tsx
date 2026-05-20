import type { Metadata } from "next";
import Link from "next/link";
import { FooterMini } from "@/components/FooterMini";
import { Icon, type IconName } from "@/components/Icon";
import { clientConfig } from "@/client.config";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: `100% money-back guarantee details for ${clientConfig.brand.name} webinar registrations.`,
  robots: { index: true, follow: true },
};

interface Section {
  icon: IconName;
  title: string;
  body: React.ReactNode;
}

export default function RefundPage() {
  const sections: Section[] = [
    {
      icon: "shield",
      title: "100% money-back guarantee",
      body: (
        <p>
          You can claim a full refund of the ₹99 registration fee if, after
          attending the live webinar, you feel the content did not deliver
          value. No paperwork, no friction, no &ldquo;sorry to see you
          go&rdquo; survey.
        </p>
      ),
    },
    {
      icon: "check",
      title: "Eligibility",
      body: (
        <>
          <p>To be eligible for a refund, you must:</p>
          <ul>
            <li>
              Have completed payment for a scheduled live webinar via the
              official checkout.
            </li>
            <li>
              Attend the live session and watch the full 3-hour broadcast.
            </li>
            <li>
              Submit the refund request before Sunday evening (11:59 PM IST)
              on the day of the webinar.
            </li>
          </ul>
        </>
      ),
    },
    {
      icon: "message",
      title: "How to request a refund",
      body: (
        <>
          <p>
            Send a WhatsApp message to the support number that arrived in your
            welcome message. Include:
          </p>
          <ul>
            <li>The name and phone number you registered with.</li>
            <li>The Cashfree order ID from your confirmation message.</li>
          </ul>
          <p>
            That&apos;s it. You do not need to justify your decision or fill
            out any form.
          </p>
        </>
      ),
    },
    {
      icon: "clock",
      title: "Processing timeline",
      body: (
        <p>
          Approved refunds are initiated within 1 business day of the request.
          The amount lands back on your original payment method within{" "}
          <strong>7&ndash;10 business days</strong> depending on your
          bank&apos;s settlement cycle. We&apos;ll confirm the refund ID on
          WhatsApp once Cashfree processes it.
        </p>
      ),
    },
    {
      icon: "x",
      title: "What is not refundable",
      body: (
        <>
          <p>
            <strong>Add-on toolkits are final.</strong> The ₹99 webinar
            registration is fully refundable under the guarantee above, but
            optional add-on bundles purchased at checkout (e.g. negotiation
            scripts, qualification checklist) are not eligible for refund
            once delivered.
          </p>
          <p>
            Refund requests submitted after the cutoff (Sunday 11:59 PM IST on
            the webinar day) cannot be honoured. Refunds also do not apply if
            you did not attend the live session — the guarantee is conditional
            on showing up.
          </p>
        </>
      ),
    },
    {
      icon: "rupee",
      title: "Currency & taxes",
      body: (
        <p>
          All amounts are in Indian Rupees (INR). Refunds are issued for the
          full transaction amount paid via Cashfree. Any applicable taxes
          collected at the time of purchase are refunded in proportion.
        </p>
      ),
    },
    {
      icon: "info",
      title: "Dispute resolution",
      body: (
        <p>
          If you believe a refund was wrongly denied, reply to the same
          WhatsApp thread and a human will review the case manually within 3
          business days. For unresolved disputes, contact us at the email
          below.
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
            <Icon name="refresh" size={32} />
            <span className={styles.heroBadgeRing} />
            <span className={styles.heroBadgeRingTwo} />
          </div>

          <span className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowDot} aria-hidden="true" />
            Legal · Refund
          </span>

          <h1 className={styles.heroTitle}>Refund Policy</h1>

          <p className={styles.heroSub}>
            ₹99 try karo. Value nahi mili? ₹99 wapas. No paperwork, no
            questions, no friction — just a WhatsApp message.
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
              This refund policy applies to all webinar registrations purchased
              from <strong>{clientConfig.brand.domain}</strong>. It is designed
              to remove every excuse for not showing up — and to keep us
              honest about the value we deliver on the live call.
            </p>
          </div>

          <div className={styles.sections}>
            {sections.map((s) => (
              <article key={s.title} className={styles.section}>
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
              <h3 className={styles.contactTitle}>Need help with a refund?</h3>
              <p className={styles.contactBody}>
                Email{" "}
                <a href="mailto:support@ketanbizlife.com">
                  support@ketanbizlife.com
                </a>{" "}
                or message the support number from your welcome WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FooterMini brand={clientConfig.brand} footer={clientConfig.footer} />
    </div>
  );
}
