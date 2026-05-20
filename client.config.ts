/**
 * Ketan BizLife — Landing Page Client Config
 *
 * Single source of truth for ALL copy, prices, dates, URLs, claim toggles, and
 * brand fields. Components are pure presentation and never contain hardcoded
 * client strings. To change a word on the site, edit this file.
 *
 * Prices, dates, and bump amounts are wired to NEXT_PUBLIC_* environment
 * variables with sensible fallbacks. Update them in .env.local (dev) or the
 * Vercel dashboard (prod) to roll changes across the entire funnel without
 * code edits. See .env.local for the full list.
 */

// ----- Env-driven knobs -----------------------------------------------------

const num = (raw: string | undefined, fallback: number): number => {
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const str = (raw: string | undefined, fallback: string): string => {
  const v = (raw ?? "").trim();
  return v.length > 0 ? v : fallback;
};

const formatINR = (n: number): string => `₹${n.toLocaleString("en-IN")}`;

const WEBINAR_PRICE = num(process.env.NEXT_PUBLIC_WEBINAR_PRICE, 99);
const WEBINAR_ANCHOR_PRICE = num(
  process.env.NEXT_PUBLIC_WEBINAR_ANCHOR_PRICE,
  499,
);
const WEBINAR_DATE_LABEL = str(
  process.env.NEXT_PUBLIC_WEBINAR_DATE_LABEL,
  "Sunday, 31st May 2026",
);
const WEBINAR_TIME_LABEL = str(
  process.env.NEXT_PUBLIC_WEBINAR_TIME_LABEL,
  "10:45 AM IST",
);
const WEBINAR_COUNTDOWN_ISO = str(
  process.env.NEXT_PUBLIC_WEBINAR_COUNTDOWN_ISO,
  "2026-05-31T10:45:00+05:30",
);
/** Length of the webinar in minutes. Used to compute the calendar event end time. */
const WEBINAR_DURATION_MINUTES = num(
  process.env.NEXT_PUBLIC_WEBINAR_DURATION_MINUTES,
  180,
);

const BUMP_PRICES = {
  buyerQualification: num(
    process.env.NEXT_PUBLIC_BUMP_BUYER_QUALIFICATION_PRICE,
    199,
  ),
  negotiationScripts: num(
    process.env.NEXT_PUBLIC_BUMP_NEGOTIATION_SCRIPTS_PRICE,
    199,
  ),
  paymentTerms: num(
    process.env.NEXT_PUBLIC_BUMP_PAYMENT_TERMS_PRICE,
    199,
  ),
  closersBundle: num(
    process.env.NEXT_PUBLIC_BUMP_CLOSERS_BUNDLE_PRICE,
    499,
  ),
};

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

export interface AgendaBlock {
  /** Optional. Older copy had hour-by-hour times; the new copy drops them. */
  time?: string;
  label: string;
  title: string;
  bullets: string[];
}

export interface TransformationRow {
  old: string;
  next: string;
}

export interface VideoTestimonial {
  id: string;
  /** Wistia media ID (e.g. "txhwzn9b7s"). Set this OR vimeoId. */
  wistiaId?: string;
  /** Vimeo video ID (e.g. "1151505324"). Set this OR wistiaId. */
  vimeoId?: string;
  /** When true, hide this video on tablet + desktop (>=640px). */
  mobileOnly?: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface BonusCard {
  /** Visual slug — maps to BonusIllustration component variant */
  illustration:
    | "verification"
    | "fob"
    | "community"
    | "lms"
    | "recording";
  label: string;
  title: string;
  description: string;
}

export interface CheckoutBump {
  id: string;
  title: string;
  price: number;
  tagline: string;
  intro: string;
  bullets: string[];
  insight?: string;
  callToAction?: string;
  /** When true, selecting this bump deselects all other bumps. */
  isBundle?: boolean;
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
    price: number;
    anchorPrice: number;
    pabblyAmountString: string;
    currency: string;
    todayOnlyLabel: string;
  };

  event: {
    dateLabel: string;
    countdownTargetISO: string;
    timeLabel: string;
    timezone: string;
    platform: string;
    language: string;
    durationLabel: string;
    /** Webinar length in minutes; used for calendar event end time. */
    durationMinutes: number;
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
    /** Uppercase kicker label rendered above the withoutItems chip strip. */
    withoutHeading: string;
    /** Short failed-tactic chips rendered below the hero CTA (premium pill row). */
    withoutItems: string[];
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
    moneyBackBadge: {
      title: string;
      body: string;
    };
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

  bonuses: {
    eyebrow: string;
    heading: string;
    subheading: string;
    cards: BonusCard[];
  };

  about: {
    eyebrow: string;
    headline: string;
    body: string;
    stats: StatCard[];
    marqueeItems: string[];
    visualCaption: string;
  };

  testimonials: {
    eyebrow: string;
    heading: string;
    videos: VideoTestimonial[];
  };

  guarantee: {
    badge: string;
    heading: string;
    paragraphs: string[];
    ctaText: string;
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
    guaranteeLine: string;
    antiQualifierHeading: string;
    antiQualifierItems: string[];
    closing: string;
    ctaText: string;
    fineprint: string;
  };

  checkout: {
    productTitle: string;
    productByline: string;
    productMeta: string;
    bonusesHeading: string;
    bumpsHeading: string;
    bumpsSubheading: string;
    bumps: CheckoutBump[];
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
    metaPixelId: string;
  };

  cashfreeModal: {
    brandName: string;
    description: string;
    themeColor: string;
    logoUrl: string;
  };

  capi: {
    enabled: boolean;
    eventName: string;
    purchaseValue: number;
    /** Optional category sent in custom_data.kind (e.g. "webinar"). Empty = omit. */
    kind: string;
  };

  approvalItems: {
    showHundredCroreClaim: boolean;
    showNineCountriesStat: boolean;
    trainedCountClaim: string | null;
    showRefundLine: boolean;
    showCompetitorAntiPositioning: boolean;
  };
}

// ----- Config ----------------------------------------------------------------

export const clientConfig: ClientConfig = {
  brand: {
    name: "Ketan BizLife",
    tagline: "Export Unstuck · Learn · Connect · Grow",
    domain: "export.ketanbizlife.in",
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
    price: WEBINAR_PRICE,
    anchorPrice: WEBINAR_ANCHOR_PRICE,
    pabblyAmountString: String(WEBINAR_PRICE),
    currency: "INR",
    todayOnlyLabel: "today only",
  },

  event: {
    dateLabel: WEBINAR_DATE_LABEL,
    countdownTargetISO: WEBINAR_COUNTDOWN_ISO,
    timeLabel: WEBINAR_TIME_LABEL,
    timezone: "Asia/Kolkata",
    platform: "Live on Zoom",
    language: "Hindi",
    durationLabel: "3 ghante actionable content",
    durationMinutes: WEBINAR_DURATION_MINUTES,
  },

  // -------- HERO --------
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
      "Without Embassy contacts. Without Google searches. Without B2B portal traps. Without Port Data scams. Without 1-year guarantee gimmicks.",
    withoutHeading: "No More of This",
    withoutItems: [
      "Embassy Contacts",
      "Google Searches",
      "B2B Portal Traps",
      "Port Data Scams",
      "1-Year Guarantee Gimmicks",
    ],
    promiseText:
      "Sunday, 31st May 2026. 3 ghante live Zoom webinar. 2 proven buyer-finding systems that can help you get genuine international orders. Wahi system jo Mein 10+ saal se 2 export brands ke saath use kar raha hoon.",
    promiseFrameworkName: "",
    countdownLabel: "Webinar shuru hone mein",
    eventDetailsLine: `Date: ${WEBINAR_DATE_LABEL}   ·   Time: ${WEBINAR_TIME_LABEL}   ·   Venue: Live on Zoom   ·   Language: Hindi`,
    priceAnchor: formatINR(WEBINAR_ANCHOR_PRICE),
    priceActual: formatINR(WEBINAR_PRICE),
    priceSuffix: "today only",
    primaryCtaText: "Book My Seat at ₹99",
    trustLine: "Live on Zoom · Hindi me · 3 ghante actionable content",
    refundLine:
      "100% Money-Back Guarantee. ₹99 wapas even after watching the entire webinar.",
    moneyBackBadge: {
      title: "100% Money-Back Guarantee",
      body:
        "Webinar attend karo, pura dekho. Agar value nahi mili, ₹99 wapas. Even after watching the entire webinar.",
    },
  },

  // -------- SECTION 2 — Scenes Recall --------
  scenes: {
    heading: "Kya Aapne Bhi Yeh Face Kiya Hai?",
    scenes: [
      "Tuesday raat 11 baje. Phone vibrate hua. “Hello, this is Mohamed from Dubai. I need your product catalog.” Tumne 4 minute mein reply kiya. Phir silence. Pura week silence. Aaj tak silence.",
      "Monday morning. 6 ghante Excel mein quote banaya. ₹4.5 lakh ka order. PDF bheja. Read receipt aaya. Reply nahi.",
      "Gulf Food exhibition. 3 din wahaan khade rahe. 200 cards baant diye. Aaj tak ek call back nahi aaya. Sirf “we will get back” wale emails.",
    ],
    outro: "Yeh exactly woh moments hain jo iss webinar mein solve hote hain.",
  },

  // -------- SECTION 3 — Who This Is For --------
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
          "Kisi coach ne spice, fruit, ya vegetable mein dhakel diya.",
          "Ghar walo ko 6 mahine se “abhi process mein hai” bol rahe ho.",
        ],
        outcome:
          "This webinar gives you the buyer-finding plus buyer communication system to crack your first real international order.",
      },
      {
        icon: "📦",
        badge: "SEGMENT 2",
        identityLead:
          "Tum already export kar rahe ho. 1 container har 2-3 mahine. Lekin scale nahi ho raha.",
        ticksHeading: "You’re stuck here?",
        bullets: [
          "Ek container nikalta hai, phir 2-3 mahine kuch nahi hota.",
          "Same buyer baar baar order nahi karta. Naye buyer lane ki system nahi hai.",
          "Daily 3-4 inquiries Excel mein likhi hain. Follow-up tracking nahi hai.",
          "Tumhara product regular hai jisme margin 3-5%. Thak gaye ho.",
          "Pehle system clear chahiye, phir scaling community join karna chahte ho.",
        ],
        outcome:
          "This webinar fixes the problem of not getting consistent buyers and gives you the follow-up approach that converts.",
      },
    ],
    closingLine: "Different starting points. One framework. One Sunday.",
    ctaText: "Book My Seat at ₹99",
  },

  // -------- SECTION 4 — What This 3-Hour Webinar Covers --------
  agenda: {
    heading: "What This 3-Hour Webinar Covers",
    subheading:
      "Sunday’s Live Webinar · 31st May 2026 · 10:45 AM IST · Zoom. Four content blocks across 3 hours. You leave with a system, not just notes.",
    blocks: [
      {
        label: "BLOCK 1",
        title: "Diagnosis: The 3 Mistakes Killing Your Export Business",
        bullets: [
          "Why your B2B portal inquiries are 90% fake (and how to filter them in 30 seconds)",
          "Why your follow-up system is broken (and how to build a relationship with the buyer)",
          "Why your communication weakens at “discount?” or “credit?” (and how to fix it)",
        ],
      },
      {
        label: "BLOCK 2",
        title: "How to Handle Buyer Conversations That Convert",
        bullets: [
          "Why buyers ghost after you send price (and the question framework that prevents it)",
          "Sample, credit, and discount objection responses that build trust instead of losing the deal",
          "Building rapport BEFORE pricing (so the buyer doesn’t use your price as ammunition with their regular supplier)",
        ],
      },
      {
        label: "BLOCK 3",
        title: "The 2 Real Buyer-Finding Systems",
        bullets: [
          "Real buyer-finding systems that you haven't seen anywhere in any webinar",
        ],
      },
      {
        label: "BLOCK 4",
        title: "Country-Specific Follow-Up Approach",
        bullets: [
          "Gulf: relationship-driven 3-5 month follow-up cycles",
          "US: fast, professional, number-driven decisions",
          "Africa: quick 15-20 day decision cycles, long-term once locked",
          "Europe: heavy documentation, quality-first conversations",
        ],
      },
    ],
    ctaText: "Book My Seat at ₹99",
  },

  // -------- SECTION 5 — Old You vs New You --------
  transformation: {
    heading: "Old You vs New You",
    headerOld: "BEFORE SUNDAY",
    headerNext: "AFTER SUNDAY",
    rows: [
      {
        old: "Daily price quote bhej rahe ho. Buyer gayab ho raha hai.",
        next: "Question framework se buyer engage ho raha hai. Ghosting kam ho rahi hai.",
      },
      {
        old: "Buyer puchhe “discount?” ya “credit?”. Tum stuck ho jaate ho.",
        next: "Confidence se discount, credit, sample objections handle kar rahe ho.",
      },
      {
        old: "Ghar walo ko 6 mahine se “process mein hai” bolna padta hai.",
        next: "Pehla international order ka clear roadmap hai. Family ko proof dikha sakte ho.",
      },
      {
        old: "2-3 lakh laga chuke ho courses, portals, exhibitions mein. ROI zero.",
        next: "₹99 mein actual system: 2 buyer-finding techniques + buyer communication + country-specific follow-up.",
      },
      {
        old: "Coach hone ka drama dekh chuke. Trust khatam.",
        next: "Real exporter dekha jo padhata bhi hai. 2 export brands, ₹100+ crore in shipments.",
      },
    ],
    outro: "Ek Sunday. ₹99. Live webinar.",
  },

  // -------- SECTION 6 — Identity Outcomes --------
  identityBadges: {
    heading: "After This Sunday, Tum Wahi Exporter Ban Jaate Ho Jo…",
    badges: [
      "…buyer ke “send your price” message ka professional reply de sakta hai. Without giving the actual price first.",
      "…Meta Ads Library mein search karke real importers shortlist kar sakta hai. Apne product category mein.",
      "…buyer ke “discount?” ya “credit?” objection ka counter-question approach jaanta hai.",
      "…follow-up ko system se chalata hai, mood se nahi. Country-specific timelines pata hain.",
    ],
    outro: "Sunday, 31st May. ₹99. Live webinar.",
    ctaText: "Book My Seat at ₹99",
  },

  // -------- SECTION 7 — Bonuses (NEW) --------
  bonuses: {
    eyebrow: "Included With Your ₹99",
    heading: "What You Also Get",
    subheading:
      "Webinar plus 5 bonuses included with your ₹99 registration.",
    cards: [
      {
        illustration: "verification",
        label: "Bonus 01",
        title: "5-Step Buyer Verification Checklist",
        description: "Avoid fraud buyers. Save lakhs in losses.",
      },
      {
        illustration: "fob",
        label: "Bonus 02",
        title: "Perfect FOB Price Calculation Sheet",
        description:
          "Price confidently without undercutting or losing profit.",
      },
      {
        illustration: "community",
        label: "Bonus 03",
        title: "Access to Premium WhatsApp Communities",
        description:
          "Network with serious exporters, not beginners asking basics.",
      },
      {
        illustration: "lms",
        label: "Bonus 04",
        title: "Mobile App & Web LMS Portal Access",
        description: "Learn anytime, anywhere with structured content.",
      },
      {
        illustration: "recording",
        label: "Bonus 05",
        title: "1-Year Recording Access",
        description: "Revise and implement at your own pace.",
      },
    ],
  },

  // -------- SECTION 8 — About Ketan --------
  about: {
    eyebrow: "About Ketan",
    headline: "Mein Bhi Wahin Tha Jahaan Aap Aaj Ho.",
    body:
      "Mein bhi struggle kiya. Courses kiye. Portals try kiye. Exhibitions attend ki. Agents ko commission diya. Zero result.\n\nSlowly, jo kaam nahi karta tha woh chhoda. Jo kaam karta tha woh systematized kiya. Buyer-finding ke 2 methods nikle jo actually genuine importers tak le jaate hain. Buyer communication ka approach develop kiya jo ghosting, credit demands, aur sample requests sambhalta hai.\n\nAaj 2 export brands chalata hoon. Saath mein financial advisory company hai (Madhusudan Tax and Wealth Management). Indian exporters ke saath wahi system share karta hoon jo Mein khud daily use karta hoon.",
    stats: [
      { value: "10+ Years", label: "Hands-on Goods Export Experience" },
      { value: "2 Brands", label: "Active Export Operations" },
      { value: "100+ Cr", label: "Cumulative Export Volume" },
      { value: "9+ Countries", label: "Gulf · Africa · Southeast Asia" },
    ],
    marqueeItems: [
      "Madhusudan",
      "10+ Years Export",
      "Gulf",
      "Africa",
      "Southeast Asia",
      "Tiles",
      "Ceramic",
      "Building Materials",
      "Display Systems",
      "₹100+ Crore Shipped",
    ],
    visualCaption:
      "Illustrative placeholder. Container B-roll and factory walkthrough drop in once Ketan delivers footage.",
  },

  // -------- SECTION 9 — Testimonials --------
  testimonials: {
    eyebrow: "Testimonials",
    heading: "Real Indian Exporters Who Used This System",
    videos: [
      { id: "testimonial-viren", vimeoId: "1151505324", mobileOnly: true },
      { id: "testimonial-1", wistiaId: "txhwzn9b7s" },
      { id: "testimonial-2", wistiaId: "uce2vo91tv" },
      { id: "testimonial-3", wistiaId: "7sde1semev" },
      { id: "testimonial-4", wistiaId: "pqfqrzkpa1" },
      { id: "testimonial-5", wistiaId: "w84s07ardv" },
      { id: "testimonial-6", wistiaId: "zjst8uyy88" },
    ],
  },

  // -------- SECTION 10 — Money-Back Guarantee --------
  guarantee: {
    badge: "100% Money-Back Guarantee",
    heading: "₹99 Try Karo. Agar Value Nahi Mili, ₹99 Wapas.",
    paragraphs: [
      "Sunday ko webinar attend karo. Pura 3 ghante dekho. Agar Sunday shaam tak aapko lagta hai value nahi mili, ek WhatsApp message bhejo. ₹99 wapas. Bina koi sawaal, bina koi paperwork, bina koi process.",
      "Mein yeh guarantee issliye de raha hoon kyunki Mein 10+ saal ka actual export experience laaya hoon iss webinar mein. Aapne 4-5 useless webinars dekhe honge. Iss 6th waale par confident hoke aao. Risk Mein le raha hoon, aap nahi.",
    ],
    ctaText: "Book My Seat at ₹99",
  },

  // -------- SECTION 11 — Anti-Positioning --------
  antiPositioning: {
    heading: "Yeh Webinar Aapko NAHI Sikhayega",
    items: [
      "IEC ya GST registration kaise karte hain. Yeh aapka CA already kar chuka hai.",
      "“Overnight crorepati” banne ka jhootha vaada. Real first-order ka realistic timeline 1 se 3 mahine hai.",
      "Spice, fruit, ya vegetable export ka push. Yeh hum aapko nahi dhakelte.",
      "10-saal purani buyer lists. Hum aapko methods sikhate hain, lists nahi bechtey.",
      "Mandatory subscription ya 12-mahine ka ad lock-in. Yahaan ek-baar ka ₹99 hai, ek-baar ki commitment.",
    ],
  },

  // -------- SECTION 12 — FAQ --------
  faq: {
    heading: "Frequently Asked Questions",
    items: [
      {
        question: "Yeh webinar kis ke liye hai?",
        answer:
          "Indian manufacturers, traders, aur sourcing agents jo physical goods export karna chahte hain. Doesn’t matter agar aapne abhi tak ek bhi order nahi kiya ya already 1 container har 2-3 mahine kar rahe ho.",
      },
      {
        question: "Recording milegi agar Sunday miss kar diya?",
        answer:
          "Haan. Sabhi registered attendees ko 1-Year Recording Access milta hai. Lekin live attend karna best hai. Recording aapka backup hai.",
      },
      {
        question: "Agar webinar mein value nahi mili to?",
        answer:
          "₹99 wapas. 100% money-back guarantee, even after watching the entire webinar. Ek WhatsApp message bhejo, paisa wapas. Bina koi sawaal.",
      },
      {
        question: "Hindi mein hoga ya English mein?",
        answer:
          "Hinglish mein. Hindi plus English mix. Technical terms English mein, experience based content Hindi mein.",
      },
      {
        question: "Kya Ketan tile aur ceramic ke alawa baaki goods bhi sikhata hai?",
        answer:
          "Haan. Methods aur frameworks product-agnostic hain. Tile, building materials, auto parts, PVC, machinery. Koi bhi physical goods. Live demo mein different categories ke examples aate hain.",
      },
      {
        question: "Kya yeh same as portals?",
        answer:
          "Bilkul opposite. Portals aapko inquiries dete hain (jo 90% fake hote hain). Yeh webinar aapko methods sikhata hai jisme aap directly real buyers tak pahunch sakte ho, without depending on portals.",
      },
    ],
  },

  // -------- SECTION 13 — Final CTA + Anti-Qualifier --------
  finalCta: {
    heading: "₹99. Sunday, 31st May 2026. 3 ghante. Ek decision.",
    guaranteeLine:
      "100% Money-Back Guarantee. Webinar dekh ke bhi value nahi mili? ₹99 wapas.",
    antiQualifierHeading: "Don’t Register If…",
    antiQualifierItems: [
      "Aapko documentation aur IEC ka basic course chahiye. Yeh webinar wahaan se shuru nahi karta.",
      "Aap “overnight crorepati” formula dhundhte ho. Real exporters 1 se 3 mahine lete hain pehla order land karne mein.",
      "Aap spice, fruit, ya vegetable export specialist banna chahte ho. Yeh webinar physical hard goods ke liye optimized hai.",
    ],
    closing: "Agar Yeh Sab Aapke Liye OK Hai, Tab:",
    ctaText: "Book My Seat at ₹99",
    fineprint:
      "Optional add-on at checkout: ₹499 toolkit including buyer qualification scripts and advanced verification checklist.",
  },

  // -------- CHECKOUT --------
  checkout: {
    productTitle: "The Export Unstuck 1-Day Webinar",
    productByline: "By Ketan Bizlife",
    productMeta:
      "Sunday, 31st May 2026 · 10:45 AM IST · Live on Zoom · Hindi",
    bonusesHeading: "5 Free Bonuses Included With Your ₹99 Registration",
    bumpsHeading: "Smart Add-ons (Optional)",
    bumpsSubheading:
      "Tools that turn what you learn on Sunday into closed deals next week.",
    bumps: [
      {
        id: "buyer-qualification",
        title: "Export Buyer Qualification Checklist",
        price: BUMP_PRICES.buyerQualification,
        tagline: "ONE-TIME OFFER",
        intro: "Instantly know which buyers are worth your time.",
        bullets: [
          "Identify serious buyers vs time-pass inquiries",
          "Know who to reply to, who to ignore, and who to test",
          "Check buyer intent, credibility, and buying capacity in minutes",
          "Reduce payment risk before sending quotes or samples",
        ],
        insight:
          "Most exporters don’t lose deals. They lose time on the wrong buyers.",
        callToAction:
          "Use this checklist immediately after Sunday’s webinar.",
      },
      {
        id: "negotiation-scripts",
        title: "Export Sales Negotiation Scripts",
        price: BUMP_PRICES.negotiationScripts,
        tagline: "ONE-TIME OFFER",
        intro:
          "Never get stuck when buyers ask uncomfortable questions.",
        bullets: [
          "Ready-to-use WhatsApp, email, and call scripts",
          "Exact replies for discount, credit, and free sample requests",
          "Say the right words without sounding desperate or unprofessional",
          "Close deals faster with proven exporter conversations",
        ],
        insight:
          "Confidence comes from knowing exactly what to say. Not guessing.",
        callToAction: "Copy. Paste. Send. Done.",
      },
      {
        id: "payment-terms",
        title: "Payment Terms Negotiation Guide (eBook)",
        price: BUMP_PRICES.paymentTerms,
        tagline: "ONE-TIME OFFER",
        intro: "Protect your money before you ship your goods.",
        bullets: [
          "Understand advance, LC, credit, and risky payment terms",
          "Learn when to accept, negotiate, or refuse payment conditions",
          "Avoid buyer tricks that cause delays and defaults",
          "Use ready-made scripts to handle payment talks confidently",
        ],
        insight:
          "One wrong payment decision can erase months of hard work.",
        callToAction: "Highly recommended before your first export order.",
      },
      {
        id: "closers-bundle",
        title: "The Export Closer’s Pack — All 3 Together",
        price: BUMP_PRICES.closersBundle,
        tagline: "BEST VALUE · BUNDLE · SAVE ₹98",
        intro: "All 3 tools above in one bundle:",
        bullets: [
          "Export Buyer Qualification Checklist (₹199)",
          "Export Sales Negotiation Scripts (₹199)",
          "Payment Terms Negotiation Guide eBook (₹199)",
        ],
        insight:
          "Individually: ₹597. Bundle today: ₹499. Webinar mein system seekhoge. In tools mein exact words milenge.",
        callToAction: "Tick only this one to get all 3.",
        isBundle: true,
      },
    ],
  },

  // -------- FOOTER --------
  footer: {
    copyright: "© 2026 Ketan BizLife Pvt Ltd. All rights reserved.",
    legalLinks: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Refund Policy", href: "/refund" },
    ],
    disclaimer:
      "Disclaimer: Results vary based on individual effort, product category, and market conditions. This webinar teaches a framework and system; outcomes depend on consistent application. No guaranteed income claims are made.",
  },

  social: {
    instagram: "",
    youtube: "",
    linkedin: "",
    twitter: "",
    whatsappChannel: "",
  },

  community: {
    whatsappGroupUrl: "https://chat.whatsapp.com/LjNwhbgRIzfJaJhMFfnS96",
    fallbackMessage:
      "WhatsApp group invite + Zoom link will reach you 30 minutes before the webinar.",
  },

  analytics: {
    gaMeasurementId: str(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, ""),
    clarityProjectId: str(process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID, ""),
    metaPixelId: str(process.env.META_PIXEL_ID, ""),
  },

  cashfreeModal: {
    brandName: "Ketan BizLife",
    description: `Indian Export Insider Workshop · ${WEBINAR_DATE_LABEL} · ${WEBINAR_TIME_LABEL}`,
    themeColor: "#2F6BFF",
    logoUrl: "",
  },

  capi: {
    enabled: true,
    eventName: "sales",
    purchaseValue: WEBINAR_PRICE,
    kind: "webinar",
  },

  approvalItems: {
    showHundredCroreClaim: true,
    showNineCountriesStat: true,
    trainedCountClaim: null,
    showRefundLine: true,
    showCompetitorAntiPositioning: true,
  },
};
