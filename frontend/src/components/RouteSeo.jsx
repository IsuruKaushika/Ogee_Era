import React from "react";
import { useLocation } from "react-router-dom";
import Seo, { SITE_URL } from "./Seo";
import { buildFaqSchema, buildFaqGroups } from "../data/faqs";
import { useSettings } from "../context/SettingsContext";

const PRIVATE = ["/login", "/cart", "/place-order", "/wishlist", "/account", "/orders", "/payment-success", "/payment-failed", "/order-confirmed"];

const PAGES = {
  "/": {
    title: "",
    description:
      "OgeeEra is a Sri Lankan fashion store for women and men. Shop dresses, tops, sarongs and sarees with islandwide delivery, cash on delivery and easy 7-day returns.",
  },
  "/collection": {
    title: "Shop Women's & Men's Fashion",
    description:
      "Browse the full OgeeEra collection of women's and men's clothing in Sri Lanka. Islandwide delivery and easy returns.",
  },
  "/about": {
    title: "About Us",
    description: "Learn about OgeeEra, a Sri Lankan online fashion store for women and men.",
  },
  "/contact": {
    title: "Contact Us",
    description: "Get in touch with OgeeEra for order help, sizing questions and support in Sri Lanka.",
  },
  "/faq": {
    title: "FAQ - Delivery, Payment & Returns",
    description:
      "Answers to common questions about ordering, payment, delivery and returns at OgeeEra, a Sri Lankan online fashion store.",
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

// Business details in structured data come from the shop settings (admin > Settings)
const buildOrganizationSchema = ({ business, social }) => {
  const phone = business.whatsapp ? `+${business.whatsapp}` : business.phone;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: business.name,
        alternateName: ["Ogee Era", "ogeeera", "ogeeera.lk"],
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        ...(phone ? { telephone: phone } : {}),
        ...(business.email ? { email: business.email } : {}),
        sameAs: [social.facebook, social.instagram, social.tiktok].filter(Boolean),
        ...(phone
          ? { contactPoint: { "@type": "ContactPoint", telephone: phone, contactType: "customer service", areaServed: "LK", availableLanguage: ["en", "si", "ta"] } }
          : {}),
        areaServed: { "@type": "Country", name: "Sri Lanka" },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: business.name,
        alternateName: ["Ogee Era", "ogeeera", "ogeeera.lk"],
        inLanguage: "en-LK",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
};

// Handles SEO for static routes. Product pages set their own tags.
const RouteSeo = () => {
  const settings = useSettings();
  const path = useLocation().pathname.replace(/\/+$/, "") || "/";

  if (path.startsWith("/product/") || path.startsWith("/category/")) return null;
  if (PRIVATE.includes(path)) return <Seo title="OgeeEra" path={path} noindex />;

  const page = PAGES[path];
  if (!page) return <Seo title="Page not found" path={path} noindex />;

  return (
    <Seo
      title={page.title}
      description={page.description}
      path={path}
      jsonLd={path === "/" ? buildOrganizationSchema(settings) : path === "/faq" ? buildFaqSchema(buildFaqGroups(settings)) : undefined}
    />
  );
};

export default RouteSeo;
