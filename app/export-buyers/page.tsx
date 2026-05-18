import type { Metadata } from "next";
import { AboutSection } from "@/components/AboutSection";
import { AgendaSection } from "@/components/AgendaSection";
import { AntiPositioningSection } from "@/components/AntiPositioningSection";
import { BonusesSection } from "@/components/BonusesSection";
import { FaqSection } from "@/components/FaqSection";
import { FinalCtaSection } from "@/components/FinalCtaSection";
import { FloatingCountdown } from "@/components/FloatingCountdown";
import { Footer } from "@/components/Footer";
import { GuaranteeSection } from "@/components/GuaranteeSection";
import { Hero } from "@/components/Hero";
import { IdentityBadgesGrid } from "@/components/IdentityBadgesGrid";
import { MobileCTABar } from "@/components/MobileCTABar";
import { ScenesSection } from "@/components/ScenesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { TransformationTable } from "@/components/TransformationTable";
import { UtmTracker } from "@/components/UtmTracker";
import { WhoSection } from "@/components/WhoSection";
import { clientConfig } from "@/client.config";
import { readUtmFromObject, utmToQueryString } from "@/lib/utm";

export const metadata: Metadata = {
  title:
    "For Indian Exporters Stuck in the Same Loop — ₹99 Live Sunday Webinar",
  description:
    "Buyer ko price diya. Buyer gayab ho gaya. Phir se. 8/10 Indian exporters fail — not because of documents, but because nobody taught them how to find real buyers. Sunday, 31st May 2026, 10:45 AM IST.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function FunnelPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const utm = readUtmFromObject(sp);
  const utmQs = utmToQueryString(utm);
  // utmToQueryString prefixes with "&"; strip when starting the query string.
  const checkoutHref = utmQs ? `/checkout?${utmQs.slice(1)}` : "/checkout";

  // Hide stats based on approval toggles (₹100+ Cr volume, 9+ Countries)
  const hiddenStatIndices: number[] = [];
  if (!clientConfig.approvalItems.showHundredCroreClaim) {
    // Stat index 2 in the new order = "100+ Cr Cumulative Export Volume"
    hiddenStatIndices.push(2);
  }
  if (!clientConfig.approvalItems.showNineCountriesStat) {
    // Stat index 3 in the new order = "9+ Countries"
    hiddenStatIndices.push(3);
  }

  // Approval Item 5 — hide the competitor anti-positioning line if toggle is off
  const antiPositioning = clientConfig.approvalItems
    .showCompetitorAntiPositioning
    ? clientConfig.antiPositioning
    : {
        ...clientConfig.antiPositioning,
        items: clientConfig.antiPositioning.items.filter(
          (item) => !item.includes("subscription"),
        ),
      };

  return (
    <>
      <UtmTracker storageKey={clientConfig.funnel.sessionStorageKey} />

      <Hero
        hero={clientConfig.hero}
        event={clientConfig.event}
        checkoutHref={checkoutHref}
        showRefundLine={clientConfig.approvalItems.showRefundLine}
      />

      <main>
        <ScenesSection scenes={clientConfig.scenes} />
        <WhoSection who={clientConfig.who} checkoutHref={checkoutHref} />
        <AgendaSection
          agenda={clientConfig.agenda}
          checkoutHref={checkoutHref}
        />
        <TransformationTable transformation={clientConfig.transformation} />
        <IdentityBadgesGrid
          identity={clientConfig.identityBadges}
          checkoutHref={checkoutHref}
        />
        <BonusesSection bonuses={clientConfig.bonuses} />
        <AboutSection
          about={clientConfig.about}
          hiddenStatIndices={hiddenStatIndices}
        />
        <TestimonialsSection testimonials={clientConfig.testimonials} />
        <GuaranteeSection
          guarantee={clientConfig.guarantee}
          checkoutHref={checkoutHref}
        />
        <AntiPositioningSection anti={antiPositioning} />
        <FaqSection faq={clientConfig.faq} />
        <FinalCtaSection
          finalCta={clientConfig.finalCta}
          checkoutHref={checkoutHref}
        />
      </main>

      <Footer
        brand={clientConfig.brand}
        footer={clientConfig.footer}
        social={clientConfig.social}
      />

      <MobileCTABar
        ctaText={clientConfig.hero.primaryCtaText}
        ctaHref={checkoutHref}
        revealAfterId="hero"
      />

      <FloatingCountdown
        targetISO={clientConfig.event.countdownTargetISO}
        revealAfterId="hero"
        ctaHref={checkoutHref}
        ctaLabel="Book Seat at ₹99"
      />
    </>
  );
}
