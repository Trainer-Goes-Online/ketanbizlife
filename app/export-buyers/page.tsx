import type { Metadata } from "next";
import { AboutSection } from "@/components/AboutSection";
import { AgendaSection } from "@/components/AgendaSection";
import { AntiPositioningSection } from "@/components/AntiPositioningSection";
import { FaqSection } from "@/components/FaqSection";
import { FinalCtaSection } from "@/components/FinalCtaSection";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { IdentityBadgesGrid } from "@/components/IdentityBadgesGrid";
import { MobileCTABar } from "@/components/MobileCTABar";
import { RajaProductSection } from "@/components/RajaProductSection";
import { ScenesSection } from "@/components/ScenesSection";
import { TransformationTable } from "@/components/TransformationTable";
import { UtmTracker } from "@/components/UtmTracker";
import { WhoSection } from "@/components/WhoSection";
import { clientConfig } from "@/client.config";

export const metadata: Metadata = {
  title:
    "For Indian Exporters Stuck in the Same Loop — ₹99 Live Sunday Webinar",
  description:
    "Buyer ko price diya. Buyer gayab ho gaya. Phir se. 8/10 Indian exporters fail — not because of documents, but because nobody taught them how to find real buyers. Iss Sunday 10:45 AM IST.",
};

export default function FunnelPage() {
  const checkoutHref = "/checkout";

  // Hide stats based on approval toggles (Item 1 = ₹100+ Cr, Item 2 = 9+ Countries)
  const hiddenStatIndices: number[] = [];
  if (!clientConfig.approvalItems.showHundredCroreClaim) {
    hiddenStatIndices.push(3); // index 3 = "100+ Cr Cumulative Export Volume"
  }
  if (!clientConfig.approvalItems.showNineCountriesStat) {
    hiddenStatIndices.push(2); // index 2 = "9+ Countries"
  }

  // Approval Item 5 — hide the competitor anti-positioning line if toggle is off
  const antiPositioning = clientConfig.approvalItems
    .showCompetitorAntiPositioning
    ? clientConfig.antiPositioning
    : {
        ...clientConfig.antiPositioning,
        items: clientConfig.antiPositioning.items.filter(
          (item) => !item.includes("₹1.5 lakh subscription"),
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
        <RajaProductSection
          raja={clientConfig.rajaProduct}
          checkoutHref={checkoutHref}
        />
        <AgendaSection
          agenda={clientConfig.agenda}
          checkoutHref={checkoutHref}
        />
        <TransformationTable transformation={clientConfig.transformation} />
        <IdentityBadgesGrid
          identity={clientConfig.identityBadges}
          checkoutHref={checkoutHref}
        />
        <AboutSection
          about={clientConfig.about}
          hiddenStatIndices={hiddenStatIndices}
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
    </>
  );
}
