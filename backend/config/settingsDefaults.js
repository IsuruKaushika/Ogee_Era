// Fallback values used until the owner saves their own in the admin panel.
// Keep this shape in sync with frontend/src/config/siteDefaults.js.
export const DEFAULT_SETTINGS = {
  business: {
    name: "OgeeEra",
    tagline: "Sri Lankan fashion for women and men. Effortless style, delivered islandwide.",
    email: "",
    phone: "",
    whatsapp: "", // digits only, international format, e.g. 94712345678
    address: "",
    hours: "",
  },
  social: { facebook: "", instagram: "", instagramHandle: "", tiktok: "" },
  logoUrl: "", // empty = bundled logo
  commerce: { deliveryFee: 400, freeDeliveryThreshold: 7500, returnDays: 7, exchangeDays: 7 },
  announcement: { enabled: true, text: "", secondaryText: "" },
  hero: {
    headline: "Timeless Style. Modern Elegance.",
    subtext: "Elevated everyday pieces, designed to make you feel confident.",
    primaryLabel: "Shop New Arrivals",
    primaryLink: "/collection",
    secondaryLabel: "Shop the Sale",
    secondaryLink: "/collection?offers=1",
    slides: [], // [{ image, title, subtitle, ctaLabel, ctaLink }]; empty = rotate best-seller photos
  },
  promos: [], // [{ image, title, subtitle, badge, ctaLabel, link, bgColor, textColor, enabled }]
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
  orderSheetUrl: "", // admin only, never sent to the public site
};
