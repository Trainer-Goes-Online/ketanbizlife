/**
 * Ketan BizLife — Landing Page Client Config
 *
 * Single source of truth for ALL copy, prices, dates, URLs, claim toggles, and
 * brand fields. Components are pure presentation and never contain hardcoded
 * client strings. To change a word on the site, edit this file.
 *
 * The 5 copy approval items from the brief are wired as toggles below — flip
 * them anytime without code changes.
 */

// ----- Types -----------------------------------------------------------------

export interface StatCard {
  value: string;
  label: string;
}

export interface SegmentCard {
  icon: string;
  badge: string;
  identityLead: string;
  ticksHeading: string;
  bullets: string[];
  outcome: string;
}

export interface RajaBlock {
  tag: string;
  title: string;
  body: string;
}

export interface AgendaBlock {
  time: string;
  label: string;
  title: string;
  bullets: string[];
}

export interface TransformationRow {
  old: string;
  next: string;
}

export interface AboutAct {
  number: string;
  label: string;
  title: string;
  body: string;
}

export interface VideoTestimonial {
  id: string;
  youtubeId: string;
  title: string;
  thumbnail?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ClientConfig {
  brand: {
    name: string;
    tagline: string;
    domain: string;
    region: string;
    language: string;
    currency: string;
    timezone: string;
  };

  funnel: {
    slug: string;
    sessionStorageKey: string;
    utmFields: readonly string[];
  };

  pricing: {
    /** Actual amount charged in INR (multiplied by 100 to send paise to Razorpay) */
    price: number;
    /** Display-only crossed-out anchor price */
    anchorPrice: number;
    /** Plain string for Pabbly webhook payload */
    pabblyAmountString: string;
    currency: string;
    todayOnlyLabel: string;
  };

  event: {
    /** Display string for the event date — e.g. "This Sunday" */
    dateLabel: string;
    /** ISO datetime for the countdown target (IST = +05:30) */
    countdownTargetISO: string;
    timeLabel: string;
    timezone: string;
    platform: string;
    language: string;
    durationLabel: string;
  };

  hero: {
    variant: "A" | "B";
    preHeaderFlag: string;
    hindiBanner: string;
    headlineLead: string;
    headlinePunchLines: string[];
    statHeadline: string;
    statLines: string[];
    withoutStack: string;
    promiseText: string;
    promiseFrameworkName: string;
    countdownLabel: string;
    eventDetailsLine: string;
    priceAnchor: string;
    priceActual: string;
    priceSuffix: string;
    primaryCtaText: string;
    trustLine: string;
    refundLine: string;
  };

  scenes: {
    heading: string;
    scenes: string[];
    outro: string;
  };

  who: {
    heading: string;
    intro: string;
    segments: [SegmentCard, SegmentCard];
    closingLine: string;
    ctaText: string;
  };

  rajaProduct: {
    eyebrow: string;
    headline: string;
    openingLine: string;
    blocks: RajaBlock[];
    closingExample: string;
    ctaText: string;
  };

  agenda: {
    heading: string;
    subheading: string;
    blocks: AgendaBlock[];
    ctaText: string;
  };

  transformation: {
    heading: string;
    headerOld: string;
    headerNext: string;
    rows: TransformationRow[];
    outro: string;
  };

  identityBadges: {
    heading: string;
    badges: string[];
    outro: string;
    ctaText: string;
  };

  about: {
    eyebrow: string;
    headline: string;
    stats: StatCard[];
    acts: AboutAct[];
    marqueeItems: string[];
    videoSectionHeading: string;
    videos: VideoTestimonial[];
  };

  antiPositioning: {
    heading: string;
    items: string[];
  };

  faq: {
    heading: string;
    items: FaqItem[];
  };

  finalCta: {
    heading: string;
    antiQualifier: string;
    body: string;
    closing: string;
    ctaText: string;
    fineprint: string;
  };

  footer: {
    copyright: string;
    legalLinks: { label: string; href: string }[];
    disclaimer: string;
  };

  social: {
    instagram: string;
    youtube: string;
    linkedin: string;
    twitter: string;
    whatsappChannel: string;
  };

  community: {
    whatsappGroupUrl: string;
    fallbackMessage: string;
  };

  analytics: {
    gaMeasurementId: string;
    clarityProjectId: string;
  };

  razorpayModal: {
    brandName: string;
    description: string;
    themeColor: string;
    logoUrl: string;
  };

  capi: {
    enabled: boolean;
    eventName: string;
    purchaseValue: number;
  };

  /**
   * The 5 copy approval items from KETAN_LP_REBUILD_BRIEF.md page "What We Need From You".
   * Defaults are conservative (the "fallback" column). Flip to true / set the string
   * to upgrade to the more aggressive claim once verified.
   */
  approvalItems: {
    /** Item 1: "₹100+ crore export volume" — used in Variation B hero proof + stat strip. */
    showHundredCroreClaim: boolean;
    /** Item 2: "9+ Countries" stat card. */
    showNineCountriesStat: boolean;
    /** Item 3: trainees count. null = "thousands", or set "4,000+" / specific number. */
    trainedCountClaim: string | null;
    /** Item 4: 30-minute refund line in Hero A trust block. */
    showRefundLine: boolean;
    /** Item 5: competitor anti-positioning line in Section 9 — "₹1.5 lakh subscription + 12-month ad lock-in". */
    showCompetitorAntiPositioning: boolean;
  };
}

// ----- Config ----------------------------------------------------------------

export const clientConfig: ClientConfig = {
  brand: {
    name: "Ketan BizLife",
    tagline: "Export Unstuck · Learn · Connect · Grow",
    domain: "lp.ketanbizlife.com",
    region: "India",
    language: "Hindi-English",
    currency: "INR",
    timezone: "Asia/Kolkata",
  },

  funnel: {
    slug: "export-buyers",
    sessionStorageKey: "ketan_utm",
    utmFields: [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
    ] as const,
  },

  pricing: {
    price: 99,
    anchorPrice: 999,
    pabblyAmountString: "99",
    currency: "INR",
    todayOnlyLabel: "today only",
  },

  event: {
    dateLabel: "This Sunday",
    // Next Sunday 24 May 2026, 10:45 AM IST. Update when shipping a subsequent webinar.
    countdownTargetISO: "2026-05-24T10:45:00+05:30",
    timeLabel: "10:45 AM IST",
    timezone: "Asia/Kolkata",
    platform: "Live on Zoom",
    language: "Hindi",
    durationLabel: "3 ghante seedha Ketan ke saath",
  },

  // -------- HERO (Variation A — sharpened winner) --------
  hero: {
    variant: "A",
    preHeaderFlag:
      "For Indian Manufacturers, Traders & Sourcing Agents Doing Goods Export",
    hindiBanner: "Export शुरू किया… पर result नहीं आ रहा?",
    headlineLead: "For Indian Exporters Stuck in the Same Loop:",
    headlinePunchLines: [
      "Buyer ko price diya.",
      "Buyer gayab ho gaya.",
      "Phir se.",
    ],
    statHeadline: "8 Out of 10 Indian Exporters Fail.",
    statLines: [
      "Not because of documents.",
      "Because nobody taught them how to find real buyers.",
    ],
    withoutStack:
      "Without spice-fruit-vegetable scams. Without fake B2B portal inquiries. Without 1-year guarantee traps from other coaches.",
    promiseText:
      "Iss Sunday, 3 ghante, live webinar. 1 framework called “Raja Product” + 2 proven buyer-finding systems that can help you get genuine international orders. Wahi system jo Mein khud 10 saal se 3 export brands ke saath use kar raha hoon.",
    promiseFrameworkName: "Raja Product",
    countdownLabel: "Webinar shuru hone me",
    eventDetailsLine:
      "Date: This Sunday   ·   Time: 10:45 AM IST   ·   Venue: Live on Zoom   ·   Language: Hindi",
    priceAnchor: "₹999",
    priceActual: "₹99",
    priceSuffix: "today only",
    primaryCtaText: "Book My ₹99 Seat → This Sunday Only",
    trustLine:
      "Live on Zoom · Hindi me · Recording nahi milegi · 3 ghante seedha Ketan ke saath",
    refundLine:
      "30 minutes me value nahi mili? Full refund. Zero risk.",
  },

  // -------- SECTION 2 — Scenes Recall --------
  scenes: {
    heading: "Yeh scenes pehchante ho?",
    scenes: [
      "Tuesday raat 11 baje. Phone vibrate hua. “Hello, this is Mohamed from Dubai. I need your product catalog.” Tumne 4 minute me reply kiya. Phir silence. Pura week silence. Aaj tak silence.",
      "Monday morning. 6 ghante Excel mein quote banaya. ₹4.5 lakh ka order. PDF bheja. Read receipt aaya. Reply nahi.",
      "Gulf Food exhibition. 3 din wahaan khade rahe. 200 cards baant diye. Aaj tak ek call back nahi aaya. Sirf “we will get back” wale emails.",
    ],
    outro: "Yeh exactly woh moments hain jo iss webinar mein solve hote hain.",
  },

  // -------- SECTION 3 — Who This Is For (2 segments) --------
  who: {
    heading: "Yeh Webinar Tumhare Liye Hai Agar…",
    intro: "Read the one that sounds like your situation.",
    segments: [
      {
        icon: "🏭",
        badge: "SEGMENT 1",
        identityLead:
          "Tum manufacturer, trader, ya sourcing agent ho. Abhi tak pehla real international order nahi aaya.",
        ticksHeading: "You ticked these boxes?",
        bullets: [
          "IEC done. GST done. Documentation pura. Abhi tak ek bhi real international buyer nahi mila.",
          "B2B portals pe paise lagaye. Sirf fake inquiries.",
          "Exhibitions me ja chuke. Card baant ke aaye. Ek bhi call back nahi.",
          "Kisi coach ne spice, fruit, ya vegetable me dhakel diya.",
          "Ghar walo ko 6 mahine se “abhi process me hai” bol rahe ho.",
        ],
        outcome:
          "This webinar gives you the exact system to crack your first real international order.",
      },
      {
        icon: "📦",
        badge: "SEGMENT 2",
        identityLead:
          "Tum already export kar rahe ho. 1 container har 2-3 mahine. Lekin scale nahi ho raha.",
        ticksHeading: "You’re stuck here?",
        bullets: [
          "Ek container nikalta hai, phir 2-3 mahine kuch nahi hota.",
          "Same buyer baar baar order nahi karta. Naye buyer system nahi hai.",
          "Daily 3-4 inquiries Excel me likhi hain. Follow-up tracking nahi hai.",
          "Tumhara product spice/commodity hai. Margin 3-5%.",
          "Thak gaye ho. Pehle system clear chahiye, phir scaling community join karna chahte ho.",
        ],
        outcome:
          "This webinar applies Raja Product to your current product and gives you the scaling playbook.",
      },
    ],
    closingLine: "Different starting points. One framework. One Sunday.",
    ctaText: "Book My ₹99 Seat → This Sunday",
  },

  // -------- SECTION 4 — Raja Product Mechanism --------
  rajaProduct: {
    eyebrow: "The Mechanism",
    headline:
      "90% Indian Exporters Galat Product Choose Karte Hain. Wahi Pehli Galti Hai.",
    openingLine:
      "Yeh sabse badi galti hai. Aur kisi ne tumhe nahi batayi.",
    blocks: [
      {
        tag: "BLOCK 1 — MISCONCEPTION",
        title: "“Yeh product export hota hai”",
        body:
          "Tum spice export karna chahte ho. Ya rice. Ya cotton. Ya frozen fruits. Kyunki kisi coach ne ya YouTube guru ne bola “yeh export hota hai bhai.”",
      },
      {
        tag: "BLOCK 2 — THE TRAP",
        title: "Har product export hota hai. Sawaal kuch aur hai.",
        body:
          "Sach yeh hai: jo bhi product ka HSN code daloge, woh export crore me hota hai. Har product ka international market hai. Toh “yeh export hota hai” kuch matlab nahi rakhta. Asli question yeh hai: yeh product TUMSE export ho sakta hai ya nahi?\n\n5,000+ Indian merchant exporters pehle se spice, fruit, vegetable me race kar rahe hain. Tum 5,001th banoge. Price war. Zero margin. Buyer chala jaata hai 50 paise saste competitor ke paas.",
      },
      {
        tag: "BLOCK 3 — THE FRAMEWORK",
        title: "Raja Product",
        body:
          "Iss webinar me Mein “Raja Product” framework dikhata hoon. Woh side product jisme competition kam hai, margin high hai, aur successful exporters silently chala rahe hain.",
      },
      {
        tag: "BLOCK 4 — CONCRETE EXAMPLE",
        title: "Tiles vs Tile Display Systems",
        body:
          "Tiles export karne ki sab race lagi hai. Mein tile DISPLAY systems export karta hoon. Har showroom waale ko display chahiye. Global demand. Competition 50, not 5,000. Margin 30%, not 3%.",
      },
    ],
    closingExample: "",
    ctaText: "Book My ₹99 Seat → This Sunday",
  },

  // -------- SECTION 5 — Hour-by-Hour Agenda --------
  agenda: {
    heading: "This Sunday’s Live Webinar Agenda",
    subheading: "Every minute mapped. You leave with a system, not just notes.",
    blocks: [
      {
        time: "10:45 AM — 11:30 AM",
        label: "HOUR 1",
        title: "Diagnosis: The 3 Mistakes Killing Your Export Business",
        bullets: [
          "Why your B2B portal inquiries are 90% fake (and how to filter them in 30 seconds)",
          "Why your follow-up system is broken (live Zoho CRM setup inside the webinar)",
          "Why your communication weakens at “discount?” or “credit?” (4 ready response scripts)",
        ],
      },
      {
        time: "11:30 AM — 12:30 PM",
        label: "HOUR 2",
        title: "The Raja Product Framework — Live Reveal",
        bullets: [
          "Why “yeh product export hota hai” is the wrong question",
          "The 3 filters Mein use karta hoon to test any product for export viability",
          "Live walkthrough using your product category (interactive Q&A)",
        ],
      },
      {
        time: "12:30 PM — 1:15 PM",
        label: "HOUR 3",
        title: "Country Selection + Buyer-Finding Systems",
        bullets: [
          "Meta Ads Library demo (95% of Indian exporters use nahi karte)",
          "LinkedIn + email combo for Europe and Western markets",
          "Country-specific channels for Gulf, Africa, Southeast Asia",
        ],
      },
      {
        time: "1:15 PM — 1:45 PM",
        label: "LAST 30 MINUTES",
        title: "Live Q&A With Ketan",
        bullets: [
          "Your specific product, country, or buyer situation answered live",
          "No pre-vetted questions. Real exporters, real problems, real answers",
        ],
      },
    ],
    ctaText: "Book My ₹99 Seat → This Sunday",
  },

  // -------- SECTION 6 — Transformation Table --------
  transformation: {
    heading: "From “Process Mein Hai” to Real Dollar Income",
    headerOld: "THE OLD YOU (today)",
    headerNext: "THE NEW YOU (after this Sunday)",
    rows: [
      {
        old: "Daily price quote bhej rahe ho. Daily buyer gayab ho raha hai.",
        next: "Raja Product framework clear hai. Exact product clear hai jo export ho sakta hai.",
      },
      {
        old: "Spice/commodity me 5,000 exporters ke saath price war.",
        next: "Low-competition product chosen. Margin 30%, not 3%.",
      },
      {
        old: "Ghar walo ko 6 mahine se “process mein hai” bolna padta hai.",
        next: "Pehla international order ka clear roadmap hai. Family ko proof dikha sakte ho.",
      },
      {
        old: "2-3 lakh laga chuke ho courses, portals, exhibitions me. ROI zero.",
        next: "₹99 mein actual system mil gaya. Free Zoho CRM setup. 4 scripts ready.",
      },
      {
        old: "Coach hone ka drama dekh chuke. Trust khatam.",
        next: "Real exporter dekha jo padhata bhi hai. Container B-roll, brand names, multiple countries.",
      },
    ],
    outro: "Yeh shift ek Sunday me hota hai. ₹99 mein. Live webinar me.",
  },

  // -------- SECTION 7 — Identity Outcomes --------
  identityBadges: {
    heading: "After This Sunday, You Become…",
    badges: [
      "The Exporter Who Cracks Their First International Order",
      "The Exporter Whose Family Stops Asking “Kab Hoga?”",
      "The Exporter Other Exporters Quietly Copy",
      "The Exporter Who Builds Real Dollar Income",
    ],
    outro: "One Sunday. All four shifts. ₹99.",
    ctaText: "Book My ₹99 Seat → This Sunday",
  },

  // -------- SECTION 8 — About Ketan --------
  about: {
    eyebrow: "About Ketan",
    headline: "Mein Coach Nahi Hoon. Mein Exporter Hoon Jo Padhata Bhi Hai.",
    stats: [
      { value: "10+ Years", label: "Building Export Business" },
      { value: "3 Brands", label: "BizLife · IJARO · Madhusudan" },
      { value: "9+ Countries", label: "Gulf · Africa · SEA" },
      { value: "100+ Cr", label: "Cumulative Export Volume" },
    ],
    acts: [
      {
        number: "01",
        label: "ACT 01",
        title: "The Failed Years (2006–2010)",
        body:
          "Delhi me trainings ke chakkar kaate. Hawaai jahaaz me paise, hotel me paise, registration me paise. Saara training “import-export documentation” pe tha. Buyer kaise lana hai, kisi ne nahi bataya. 4 saal yeh sochte hue waste ho gaye ki documentation mein kuch missing hai.",
      },
      {
        number: "02",
        label: "ACT 02",
        title: "The System That Changed Everything (2010–2012)",
        body:
          "Phir Mein ne apna system banaya. Raja Product framework. Country-by-country buyer finding. Negotiation scripts. Follow-up structure. Pehla container 2012 mein nikla. Phir doosra. Phir teesra. Aur phir 3 brands shuru hue: BizLife. IJARO. Madhusudan.",
      },
      {
        number: "03",
        label: "ACT 03",
        title: "Today (2026)",
        body:
          "10+ saal export business. Tiles, ceramic, building materials, display systems Gulf, Africa, aur Southeast Asia mein. Aur thousands of Indian exporters mere webinars aur workshops mein attend kar chuke hain.",
      },
    ],
    marqueeItems: [
      "BizLife",
      "IJARO",
      "Madhusudan",
      "10+ Years Export",
      "Gulf",
      "Africa",
      "Southeast Asia",
      "Thousands Trained",
      "Tiles",
      "Ceramic",
      "Building Materials",
      "Display Systems",
      "Raja Product Framework",
    ],
    videoSectionHeading: "Real Exporters · Real Words",
    videos: [
      // Placeholder YouTube IDs — replace with real Shorts IDs from the winning LP.
      // The components use the embed-on-click pattern (thumbnail until clicked).
      {
        id: "testimonial-1",
        youtubeId: "",
        title: "Student testimonial 1 (YouTube Short)",
      },
      {
        id: "testimonial-2",
        youtubeId: "",
        title: "Student testimonial 2 (YouTube Short)",
      },
    ],
  },

  // -------- SECTION 9 — Anti-Positioning --------
  antiPositioning: {
    heading: "5 Cheezein Jo Yeh Webinar Tumhe NAHI Bolega",
    items: [
      "Mein 1-year “guarantee” nahi deta. (Why this is actually a 12-month ad spend trap)",
      "Mein “kal hi crorepati ban jao” nahi bolta. (Real timeline: first order 1-3 months, repeat 6-12)",
      "Mein tumhe spice, fruit, ya vegetable me nahi dhakelta. (Opposite of Raja Product)",
      "Mein 10 saal purani buyer list nahi deta. (Why those lists are dead)",
      "Mein “₹1.5 lakh subscription + 12 mahine mandatory ad lock-in” nahi bechta.",
    ],
  },

  // -------- SECTION 10 — FAQ --------
  faq: {
    heading: "Sawaal Jo Tumhare Mann Mein Hain",
    items: [
      {
        question: "Mere buyers reply hi nahi karte. Yeh webinar woh fix karega?",
        answer:
          "Haan, exactly yahi sabse pehla problem hai jo hum solve karte hain. Hour 1 me “Diagnosis” session hai jismein dikhate hain ki tumhari B2B portal inquiries 90% kyun fake hoti hain aur unhe 30 second me kaise filter karna hai. Plus 4 ready response scripts milte hain jo communication breakdown rokte hain when buyer asks “discount?” or “credit?”",
      },
      {
        question: "Order ka guarantee dete ho?",
        answer:
          "Nahi. Honest answer — jo bhi tumhe order ka guarantee de raha hai, woh ya toh tumse jhooth bol raha hai ya tumhare paise se 1-year ad spend karwa raha hai. Mein system deta hoon. Tum daily kaam karte ho, system kaam karta hai. Real timeline: pehla order 1-3 months, repeat 6-12 months. Mehnat tumhari, framework mera.",
      },
      {
        question: "Mein beginner hoon. Pehla order nahi mila. Kaam aayega?",
        answer:
          "Bilkul. Webinar specifically 2 segments ke liye banaya gaya hai — Segment 1: manufacturers, traders, sourcing agents jinka pehla international order nahi aaya. Tum exactly yahi segment ho. Hour 2 me Raja Product framework live dikhayenge with your product category in Q&A.",
      },
      {
        question: "Recording milegi agar Sunday miss kar diya?",
        answer:
          "Nahi. Yeh deliberate hai. Live-only isliye rakha hai kyunki Hour 2 ka product walkthrough aur Hour 4 ka Q&A interactive hai — tumhare specific product, country, buyer situation pe live answers. Recording dekh ke woh value waste ho jaati hai. Iss Sunday 10:45 AM IST. Pakka time block kar lo.",
      },
      {
        question: "Webinar ke baad kuch upsell hai?",
        answer:
          "Haan, transparent answer — ek ₹4,999 ka deeper workshop hai jo iss webinar ke end me offer karte hain, jismein 4 hafte ki live community access aur weekly review calls hain. Lekin yeh totally optional hai. Webinar ka ₹99 wala value standalone diya jaata hai. Workshop chahiye toh lo, nahi chahiye toh aise hi nikal jao with framework + scripts + CRM setup.",
      },
    ],
  },

  // -------- SECTION 11 — Final CTA with Anti-Qualifier --------
  finalCta: {
    heading: "This Sunday. 10:45 AM. Live Zoom.",
    antiQualifier:
      "If you want a motivational video, a “buyer list” you can copy-paste, or a one-click hack, DON’T register. This is the actual system. It needs your attention for 3 hours and your daily action for 90 days.",
    body:
      "But if you’re ready for the framework that 80% of Indian exporters never discover, the one that took 4 years of mistakes to build, and the one that runs 3 export brands today, book your ₹99 seat.",
    closing:
      "By 1:45 PM Sunday, tumhe pata chal jayega ki tumhara Raja Product kya ho sakta hai, kis country me pehla buyer dhoondhna hai, aur usse exactly kya message bhejna hai pehli baar. Pehla step dollar income ki taraf.",
    ctaText: "Book My ₹99 Seat Now",
    fineprint:
      "Link 30 minutes pehle WhatsApp pe aayegi. Hindi me hoga. Camera optional hai. Notebook saath rakhna.",
  },

  // -------- FOOTER --------
  footer: {
    copyright: "© 2026 Ketan BizLife Pvt Ltd. All rights reserved.",
    legalLinks: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Refund Policy", href: "/terms#refund" },
    ],
    disclaimer:
      "Disclaimer: Results vary based on individual effort, product category, and market conditions. This webinar teaches a framework and system; outcomes depend on consistent application. No guaranteed income claims are made.",
  },

  // -------- SOCIAL (footer icons; render only when non-empty) --------
  social: {
    instagram: "",
    youtube: "",
    linkedin: "",
    twitter: "",
    whatsappChannel: "",
  },

  // -------- COMMUNITY (thank-you page CTA; renders only when non-empty) --------
  community: {
    whatsappGroupUrl: "",
    fallbackMessage:
      "WhatsApp group invite + Zoom link will reach you 30 minutes before the webinar.",
  },

  // -------- ANALYTICS (script tags render only when non-empty) --------
  analytics: {
    gaMeasurementId: "",
    clarityProjectId: "",
  },

  // -------- RAZORPAY MODAL --------
  razorpayModal: {
    brandName: "Ketan BizLife",
    description: "Indian Export Insider Workshop · This Sunday 10:45 AM IST",
    themeColor: "#2563EB",
    // Razorpay needs a publicly-reachable HTTPS URL. Paste Vercel preview URL of /logo.svg after first deploy.
    logoUrl: "",
  },

  // -------- META CAPI --------
  capi: {
    enabled: true,
    eventName: "Purchase",
    purchaseValue: 99,
  },

  // -------- 5 COPY APPROVAL TOGGLES (defaults = conservative fallbacks) --------
  approvalItems: {
    showHundredCroreClaim: true, // Hero A uses Section 8 stat strip; toggle flips the 4th stat card
    showNineCountriesStat: true,
    trainedCountClaim: null, // null → "thousands"; set "4,000+" once verified
    showRefundLine: false, // 30-min refund line off by default — flip on once you confirm operational ability to refund
    showCompetitorAntiPositioning: true, // Section 9 item #5 — competitor anti-positioning line
  },
};
