// Fallback values shown until the shop settings load from the server (admin panel > Settings).
// Plain ESM with no JSX: also read by scripts/prerender.mjs. Keep in sync with backend/config/settingsDefaults.js.
export const DEFAULT_SETTINGS = {
  business: {
    name: "OgeeEra",
    tagline: "Sri Lankan fashion for women and men. Effortless style, delivered islandwide.",
    email: "ogeeeraa@gmail.com",
    phone: "+94 71 220 5395",
    whatsapp: "94712205395", // digits only, international format
    address: "191/2, Ambagahawatta, Kalawana",
    hours: "",
  },
  social: { facebook: "", instagram: "", instagramHandle: "", tiktok: "" },
  logoUrl: "",
  commerce: { deliveryFee: 400, freeDeliveryThreshold: 7500, returnDays: 7, exchangeDays: 7 },
  announcement: { enabled: true, text: "", secondaryText: "" },
  hero: {
    headline: "Timeless Style. Modern Elegance.",
    subtext: "Elevated everyday pieces, designed to make you feel confident.",
    primaryLabel: "Shop New Arrivals",
    primaryLink: "/collection",
    secondaryLabel: "Shop the Sale",
    secondaryLink: "/collection?offers=1",
    quotes: [
      { title: "Timeless Style. Modern Elegance.", subtitle: "Elevated everyday pieces, designed to make you feel confident." },
      { title: "Made for Island Days.", subtitle: "Light, breathable fabrics that move with you from morning to night." },
      { title: "Dress the Moment.", subtitle: "Pieces you will reach for again and again." },
      { title: "Effortless, Always.", subtitle: "Easy silhouettes and soft prints for every day of the week." },
      { title: "Wear Your Story.", subtitle: "Fashion with a little Sri Lankan sunshine." },
    ],
    productCtaLabel: "Shop this piece",
    slides: [],
  },
  promos: [],
  sections: {
    categories: true,
    newArrivals: true,
    promos: true,
    bestSellers: true,
    specialOffers: true,
    policyStrip: true,
    reviews: true,
    instagram: true,
    newsletter: true,
  },
  newsletter: { title: "Join the list", text: "Early access to new arrivals, exclusive offers and style inspiration." },
};

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
export const mergeSettings = (base, over) => {
  if (!isObj(base) || !isObj(over)) return over === undefined ? base : over;
  const out = { ...base };
  for (const k of Object.keys(over)) out[k] = k in base ? mergeSettings(base[k], over[k]) : over[k];
  return out;
};

// "Rs. 7,500"
export const rs = (n) => `Rs. ${Number(n || 0).toLocaleString("en-LK")}`;
