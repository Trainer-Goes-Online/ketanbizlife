import type { ClientConfig } from "@/client.config";
import { CTAButton } from "./CTAButton";
import { Countdown } from "./Countdown";
import { EventDetailsStrip } from "./EventDetailsStrip";
import { HindiBanner } from "./HindiBanner";
import { PriceBlock } from "./PriceBlock";
import { TrustLine } from "./TrustLine";
import styles from "./Hero.module.css";

interface Props {
  hero: ClientConfig["hero"];
  event: ClientConfig["event"];
  checkoutHref: string;
  showRefundLine: boolean;
}

export function Hero({ hero, event, checkoutHref, showRefundLine }: Props) {
  return (
    <header id="hero" className={styles.hero}>
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.gridGlow} />
      </div>
      <div className={`container ${styles.inner}`}>
        <p className={styles.preHeader}>{hero.preHeaderFlag}</p>

        <HindiBanner text={hero.hindiBanner} />

        <h1 className={styles.headline}>
          <span className={styles.headlineLead}>{hero.headlineLead}</span>
          {hero.headlinePunchLines.map((line, i) => (
            <span key={i} className={styles.headlinePunch}>
              {line}
            </span>
          ))}
        </h1>

        <div className={styles.stat}>
          <p className={styles.statHeadline}>{hero.statHeadline}</p>
          {hero.statLines.map((line, i) => (
            <p key={i} className={styles.statLine}>
              {line}
            </p>
          ))}
        </div>

        <p className={styles.withoutStack}>
          <em>{hero.withoutStack}</em>
        </p>

        <p className={styles.promise}>{hero.promiseText}</p>

        <Countdown
          targetISO={event.countdownTargetISO}
          label={hero.countdownLabel}
        />

        <EventDetailsStrip text={hero.eventDetailsLine} />

        <PriceBlock
          anchor={hero.priceAnchor}
          actual={hero.priceActual}
          suffix={hero.priceSuffix}
        />

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
        </div>

        <TrustLine
          text={hero.trustLine}
          refundLine={showRefundLine ? hero.refundLine : null}
        />
      </div>
    </header>
  );
}
