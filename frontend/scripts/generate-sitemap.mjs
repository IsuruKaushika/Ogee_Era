// Generates public/sitemap.xml from static routes + products in the backend.
// Runs automatically before `npm run build`. Falls back to static routes if the API is unreachable.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE_URL = "https://www.ogeeera.lk";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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

const staticPages = [
  ["/", "daily", "1.0"],
  ["/collection", "daily", "0.9"],
  ["/about", "monthly", "0.6"],
  ["/contact", "monthly", "0.6"],
  ["/terms-and-conditions", "yearly", "0.4"],
  ["/privacy-and-policy", "yearly", "0.4"],
  ["/return-policy", "yearly", "0.4"],
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const entry = (loc, changefreq, priority, lastmod, images = []) =>
  `  <url>\n    <loc>${esc(loc)}</loc>\n` +
  (lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : "") +
  `    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n` +
  images.map((i) => `    <image:image><image:loc>${esc(i)}</image:loc></image:image>\n`).join("") +
  `  </url>`;

let products = [];
const backend = readEnv().VITE_BACKEND_URL;
try {
  if (!backend) throw new Error("VITE_BACKEND_URL not set");
  const res = await fetch(`${backend.replace(/\/$/, "")}/api/product/list`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  products = data.products;
} catch (e) {
  console.warn(`[sitemap] Could not fetch products (${e.message}); writing static pages only.`);
}

const urls = [
  ...staticPages.map(([p, f, pr]) => entry(SITE_URL + p, f, pr)),
  ...products.map((p) =>
    entry(
      `${SITE_URL}/product/${p._id}`,
      "weekly",
      "0.8",
      p.date ? new Date(p.date).toISOString().slice(0, 10) : undefined,
      (p.image || []).slice(0, 5),
    ),
  ),
];

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
  urls.join("\n") +
  `\n</urlset>\n`;

fs.writeFileSync(path.join(root, "public", "sitemap.xml"), xml);
console.log(`[sitemap] Wrote ${urls.length} URLs (${products.length} products).`);
