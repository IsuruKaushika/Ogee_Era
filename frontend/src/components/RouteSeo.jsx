import React from "react";
import { useLocation } from "react-router-dom";
import Seo, { SITE_URL } from "./Seo";

const PRIVATE = ["/login", "/cart", "/place-order", "/wishlist", "/account", "/orders", "/payment-success", "/payment-failed"];

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
      name: "OgeeEra",
      alternateName: ["Ogee Era", "ogeeera", "ogeeera.lk"],
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      telephone: "+94712205395",
      sameAs: [
        "https://www.facebook.com/share/1BZtCgfBgd/",
        "https://www.instagram.com/ogee_era",
        "https://www.tiktok.com/@0gee_era",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+94712205395",
        contactType: "customer service",
        areaServed: "LK",
        availableLanguage: ["en", "si", "ta"],
      },
      areaServed: { "@type": "Country", name: "Sri Lanka" },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "OgeeEra",
      alternateName: ["Ogee Era", "ogeeera", "ogeeera.lk"],
      inLanguage: "en-LK",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

// Handles SEO for static routes. Product pages set their own tags.
const RouteSeo = () => {
  const path = useLocation().pathname.replace(/\/+$/, "") || "/";

  if (path.startsWith("/product/")) return null;
  if (PRIVATE.includes(path)) return <Seo title="OgeeEra" path={path} noindex />;

  const page = PAGES[path];
  if (!page) return <Seo title="Page not found" path={path} noindex />;

  return (
    <Seo
      title={page.title}
      description={page.description}
      path={path}
      jsonLd={path === "/" ? organizationSchema : undefined}
    />
  );
};

export default RouteSeo;
