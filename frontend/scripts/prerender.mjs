// Post-build: writes a static HTML copy of dist/index.html for each public route and product,
// with real <title>, meta tags, JSON-LD and a text fallback inside #root so crawlers that
// don't run JavaScript still see the content. The React app still mounts normally; main.jsx
// removes every [data-prerender] tag before Helmet adds its own, so nothing is duplicated.
// Keep PAGES in sync with src/components/RouteSeo.jsx. Never fails the build.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE_URL = "https://www.ogeeera.lk";
const SITE_NAME = "OgeeEra";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

const PAGES = {
  "/": {
    title: "",
    description:
      "OgeeEra is a Sri Lankan fashion store for women, men, and kids. Shop trending clothing with secure checkout, islandwide delivery, and easy returns.",
  },
  "/collection": {
    title: "Shop Women's, Men's & Kids' Fashion",
    description:
      "Browse the full OgeeEra collection of women's, men's and kids' clothing in Sri Lanka. Islandwide delivery and easy returns.",
  },
  "/about": {
    title: "About Us",
    description: "Learn about OgeeEra, a Sri Lankan online fashion store for the whole family.",
  },
  "/contact": {
    title: "Contact Us",
    description: "Get in touch with OgeeEra for order help, sizing questions and support in Sri Lanka.",
  },
  "/terms-and-conditions": {
    title: "Terms & Conditions",
    description: "Read the terms and conditions for shopping at OgeeEra.",
  },
  "/privacy-and-policy": {
    title: "Privacy Policy",
    description: "How OgeeEra collects, uses and protects your personal information.",
  },
  "/return-policy": {
    title: "Return & Exchange Policy",
    description: "OgeeEra's return and exchange policy for online orders in Sri Lanka.",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: ["Ogee Era", "ogeeera", "ogeeera.lk"],
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      telephone: "+94712205395",
      sameAs: [
        "https://www.facebook.com/share/1BZtCgfBgd/",
        "https://www.instagram.com/ogee_era",
        "https://www.tiktok.com/@0gee_era",
      ],
      areaServed: { "@type": "Country", name: "Sri Lanka" },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: ["Ogee Era", "ogeeera", "ogeeera.lk"],
      inLanguage: "en-LK",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const jsonScript = (obj) =>
  `<script type="application/ld+json" data-prerender>${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;

const render = (template, { title, description, urlPath, image, type, schemas, body }) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Online Fashion Store Sri Lanka`;
  const url = `${SITE_URL}${urlPath === "/" ? "" : urlPath}` || SITE_URL;
  const head = [
    `<meta name="description" content="${esc(description)}" data-prerender />`,
    `<link rel="canonical" href="${esc(url)}" data-prerender />`,
    `<meta name="robots" content="index,follow,max-image-preview:large" data-prerender />`,
    `<meta property="og:title" content="${esc(fullTitle)}" data-prerender />`,
    `<meta property="og:description" content="${esc(description)}" data-prerender />`,
    `<meta property="og:url" content="${esc(url)}" data-prerender />`,
    `<meta property="og:type" content="${type}" data-prerender />`,
    `<meta property="og:image" content="${esc(image)}" data-prerender />`,
    `<meta name="twitter:title" content="${esc(fullTitle)}" data-prerender />`,
    `<meta name="twitter:description" content="${esc(description)}" data-prerender />`,
    `<meta name="twitter:image" content="${esc(image)}" data-prerender />`,
    ...schemas.map(jsonScript),
  ].join("\n    ");

  return template
    .replace(/<title>.*?<\/title>/s, `<title>${esc(fullTitle)}</title>`)
    .replace("</head>", `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
};

const write = (urlPath, html) => {
  const file = urlPath === "/" ? path.join(dist, "index.html") : path.join(dist, urlPath, "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
};

const readEnv = () => {
  const out = { ...process.env };
  try {
    for (const line of fs.readFileSync(path.join(root, ".env"), "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in out)) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
  return out;
};

try {
  const templatePath = path.join(dist, "index.html");
  if (!fs.existsSync(templatePath)) throw new Error("dist/index.html not found (run vite build first)");
  const template = fs.readFileSync(templatePath, "utf8");
  const nav =
    `<nav><a href="/">Home</a> <a href="/collection">Collection</a> <a href="/about">About</a> ` +
    `<a href="/contact">Contact</a> <a href="/return-policy">Return policy</a></nav>`;

  let count = 0;
  for (const [urlPath, page] of Object.entries(PAGES)) {
    const heading = urlPath === "/" ? `${SITE_NAME} - Online Fashion Store Sri Lanka` : page.title;
    write(
      urlPath,
      render(template, {
        title: page.title,
        description: page.description,
        urlPath,
        image: `${SITE_URL}/logo.png`,
        type: "website",
        schemas: urlPath === "/" ? [organizationSchema] : [],
        body: `${nav}<h1>${esc(heading)}</h1><p>${esc(page.description)}</p>`,
      }),
    );
    count++;
  }

  const backend = readEnv().VITE_BACKEND_URL;
  try {
    if (!backend) throw new Error("VITE_BACKEND_URL not set");
    const res = await fetch(`${backend.replace(/\/$/, "")}/api/product/list`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    for (const p of data.products) {
      const finalPrice = p.discount ? p.price - (p.price * p.discount) / 100 : p.price;
      const availability =
        p.stockStatus === "Out of Stock"
          ? "https://schema.org/OutOfStock"
          : p.stockStatus === "Limited Stock"
            ? "https://schema.org/LimitedAvailability"
            : "https://schema.org/InStock";
      const urlPath = `/product/${p._id}`;
      const description = String(p.description || "").replace(/\s+/g, " ").slice(0, 155);
      write(
        urlPath,
        render(template, {
          title: p.name,
          description,
          urlPath,
          image: p.image?.[0] || `${SITE_URL}/logo.png`,
          type: "product",
          schemas: [
            {
              "@context": "https://schema.org",
              "@type": "Product",
              name: p.name,
              description: p.description,
              image: p.image,
              category: `${p.category} / ${p.subCategory}`,
              brand: { "@type": "Brand", name: SITE_NAME },
              offers: {
                "@type": "Offer",
                url: `${SITE_URL}${urlPath}`,
                priceCurrency: "LKR",
                price: Number(finalPrice).toFixed(2),
                availability,
                itemCondition: "https://schema.org/NewCondition",
              },
            },
          ],
          body:
            `${nav}<h1>${esc(p.name)}</h1><p>${esc(p.description)}</p>` +
            `<p>Rs. ${Number(finalPrice).toFixed(2)}</p>` +
            (p.image?.[0] ? `<img src="${esc(p.image[0])}" alt="${esc(p.name)}" />` : ""),
        }),
      );
      count++;
    }
  } catch (e) {
    console.warn(`[prerender] Skipping products (${e.message}).`);
  }
  console.log(`[prerender] Wrote ${count} static pages.`);
} catch (e) {
  console.warn(`[prerender] Skipped: ${e.message}`);
}
