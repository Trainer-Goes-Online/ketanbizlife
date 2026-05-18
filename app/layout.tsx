import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Noto_Sans_Devanagari } from "next/font/google";
import Script from "next/script";
import { MetaPixelPageView } from "@/components/MetaPixelPageView";
import { clientConfig } from "@/client.config";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://${clientConfig.brand.domain}`),
  title: {
    default: `${clientConfig.brand.name} · Find Real Export Buyers Using AI`,
    template: `%s · ${clientConfig.brand.name}`,
  },
  description:
    "8 out of 10 Indian exporters fail. Not because of documents — because nobody taught them how to find real buyers. Live 3-hour Sunday webinar with Ketan: Raja Product framework + 2 buyer-finding systems for ₹99.",
  keywords: [
    "export buyers",
    "indian exporters",
    "raja product framework",
    "ketan bizlife",
    "export webinar",
    "international buyers",
  ],
  authors: [{ name: clientConfig.brand.name }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: clientConfig.brand.name,
    title: `${clientConfig.brand.name} · Indian Export Insider Workshop`,
    description:
      "Live 3-hour Sunday webinar. Raja Product framework + 2 proven buyer-finding systems for Indian exporters. ₹99 today only.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${clientConfig.brand.name} · Indian Export Insider Workshop`,
    description:
      "Live 3-hour Sunday webinar. Raja Product framework + 2 proven buyer-finding systems for Indian exporters.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#050814",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { gaMeasurementId, clarityProjectId, metaPixelId } =
    clientConfig.analytics;
  const productionDomain = clientConfig.brand.domain;

  // All three analytics scripts are rendered unconditionally on every page,
  // but each one wraps its init in a runtime host check so it only activates
  // on the production brand domain. localhost and any *.vercel.app preview
  // URL never fire PageViews or send data to Meta / GA4 / Clarity.
  // The check is done client-side (window.location.host) instead of via
  // next/headers so the layout stays static-prerenderable for "/", "/privacy",
  // "/terms", "/thank-you", etc.

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${notoDevanagari.variable}`}
    >
      <body>
        {children}

        {/* Meta Pixel — base init, no auto PageView (handled by MetaPixelPageView below) */}
        {metaPixelId ? (
          <>
            <Script id="meta-pixel-init" strategy="afterInteractive">
              {`if (window.location.host.toLowerCase() === "${productionDomain}") {
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${metaPixelId}');
              }`}
            </Script>
            <MetaPixelPageView productionDomain={productionDomain} />
          </>
        ) : null}

        {/* GA4 — host-gated client-side */}
        {gaMeasurementId ? (
          <Script id="ga4-loader" strategy="afterInteractive">
            {`if (window.location.host.toLowerCase() === "${productionDomain}") {
              var s = document.createElement('script');
              s.async = true;
              s.src = 'https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}';
              document.head.appendChild(s);
              window.dataLayer = window.dataLayer || [];
              window.gtag = function(){window.dataLayer.push(arguments);};
              window.gtag('js', new Date());
              window.gtag('config', '${gaMeasurementId}');
            }`}
          </Script>
        ) : null}

        {/* Microsoft Clarity — host-gated client-side */}
        {clarityProjectId ? (
          <Script id="clarity-init" strategy="afterInteractive">
            {`if (window.location.host.toLowerCase() === "${productionDomain}") {
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityProjectId}");
            }`}
          </Script>
        ) : null}
      </body>
    </html>
  );
}
