// Category landing pages (/category/:slug). Plain ESM, no JSX: also read by scripts/prerender.mjs
// and scripts/generate-sitemap.mjs so crawlers get real titles and copy for each category.
export const CATEGORIES = {
  dresses: {
    label: "Dresses",
    title: "Women's Dresses Online in Sri Lanka",
    description:
      "Shop midi, maxi and mini dresses at OgeeEra. Easy-care fabrics, islandwide delivery across Sri Lanka, cash on delivery and 7-day returns.",
    intro:
      "From breezy midi dresses to statement maxis, our dresses are chosen for comfort in Sri Lankan weather and made to be worn again and again. Every dress page lists the fabric and sizing, and we deliver islandwide.",
    match: (p) => p.subCategory === "Dress",
  },
  tops: {
    label: "Tops",
    title: "Women's Tops & Blouses Online in Sri Lanka",
    description:
      "Discover women's tops and blouses at OgeeEra. Easy everyday styles, islandwide delivery, cash on delivery and easy 7-day returns.",
    intro:
      "Easy tops that go with everything in your wardrobe, from office days to weekend plans. Check the size notes on each product and message us on WhatsApp if you would like help choosing a fit.",
    match: (p) => ["Tops", "TopWear"].includes(p.subCategory),
  },
  sarongs: {
    label: "Lungi & Sarong",
    title: "Sarongs & Lungi Online in Sri Lanka",
    description:
      "Buy comfortable cotton sarongs and lungi for women and men at OgeeEra. Beautiful prints, islandwide delivery and cash on delivery.",
    intro:
      "Soft, breathable sarongs and lungi in bold prints and classic colours, for home, travel and everyday wear. Available for women and men, delivered across Sri Lanka.",
    match: (p) => p.subCategory === "Lungi&Sarong",
  },
  sarees: {
    label: "Sarees",
    title: "Sarees Online in Sri Lanka",
    description: "Shop elegant sarees at OgeeEra with islandwide delivery across Sri Lanka and easy returns.",
    intro: "Elegant sarees for celebrations and special occasions, delivered islandwide with careful packing.",
    match: (p) => p.subCategory === "Saree",
  },
  men: {
    label: "Men",
    title: "Men's Sarongs & Clothing Online in Sri Lanka",
    description: "Shop men's sarongs and clothing at OgeeEra. Islandwide delivery in Sri Lanka, cash on delivery and 7-day returns.",
    intro: "Quality men's sarongs and tops, made for comfort and delivered islandwide across Sri Lanka.",
    match: (p) => p.category === "Men",
  },
};

export const CATEGORY_SLUGS = Object.keys(CATEGORIES);
