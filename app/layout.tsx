import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Noto_Sans_Devanagari } from "next/font/google";
import Script from "next/script";
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
  const { gaMeasurementId, clarityProjectId } = clientConfig.analytics;

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${notoDevanagari.variable}`}
    >
      <body>
        {children}

        {/* GA4 — render only when measurement ID is set */}
        {gaMeasurementId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}', { anonymize_ip: true });
              `}
            </Script>
          </>
        ) : null}

        {/* Microsoft Clarity — render only when project ID is set */}
        {clarityProjectId ? (
          <Script id="clarity-init" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityProjectId}");
            `}
          </Script>
        ) : null}
      </body>
    </html>
  );
}
