// FAQ content. Numbers and contact details are filled in from the shop settings (admin > Settings), so the
// answers can never disagree with the cart, product pages or return policy. Plain ESM, no JSX: also used
// by scripts/prerender.mjs.
import { DEFAULT_SETTINGS } from "../config/siteDefaults.js";

const rs = (n) => `Rs. ${Number(n || 0).toLocaleString("en-LK")}`;

export const buildFaqGroups = (s = DEFAULT_SETTINGS) => {
  const { business: b, commerce: c } = s;
  const contactBits = [
    b.email && `email ${b.email}`,
    b.phone && `call${b.whatsapp ? " or WhatsApp" : ""} ${b.phone}`,
    "use the contact form on the Contact page",
  ].filter(Boolean);
  const contact = `You can ${contactBits.join(", ").replace(/, ([^,]*)$/, ", or $1")}.${b.hours ? ` Working hours: ${b.hours}.` : ""}`;

  const delivery =
    c.freeDeliveryThreshold > 0
      ? `Delivery is a flat ${rs(c.deliveryFee)} anywhere in Sri Lanka, and it is free on orders of ${rs(c.freeDeliveryThreshold)} or more (after discounts). The delivery cost is shown on every product page and in your cart before you pay.`
      : `Delivery is a flat ${rs(c.deliveryFee)} anywhere in Sri Lanka. The cost is shown in your cart before you pay.`;

  return [
    {
      title: `About ${b.name}`,
      items: [
        {
          q: `What is ${b.name}?`,
          a: `${b.name} is a Sri Lankan online fashion store. You can order online with secure checkout and islandwide delivery.`,
        },
        { q: `How can I contact ${b.name}?`, a: contact },
      ],
    },
    {
      title: "Ordering & payment",
      items: [
        {
          q: "How do I place an order?",
          a: "Browse the collection, choose your size and add items to your cart, then go to checkout. No account is needed: you can check out as a guest, or log in to see your orders later. Your order is confirmed once you receive the confirmation email.",
        },
        {
          q: "What payment methods do you accept?",
          a: "You can pay by Cash on Delivery or pay online by card through our secure payment partner, PayHere.",
        },
        {
          q: "How do I choose the right size?",
          a: "Where available, a size chart is shown on the product page. If you are unsure about a fit, contact us before ordering and we will help you choose.",
        },
      ],
    },
    {
      title: "Delivery",
      items: [
        { q: "Do you deliver islandwide in Sri Lanka?", a: `Yes. ${b.name} delivers to addresses across Sri Lanka.` },
        { q: "How much is delivery?", a: delivery },
        {
          q: "How can I track my order?",
          a: `You receive an order confirmation email after you order. If you have an account, you can see your orders and their status on the My Orders page.${b.whatsapp ? " Guests can message us on WhatsApp with their order reference for an update." : ""}`,
        },
      ],
    },
    {
      title: "Returns, exchanges & refunds",
      items: [
        {
          q: "What is your return policy?",
          a: `We accept returns within ${c.returnDays} days of your purchase date. Items must be unused, in original condition and in their original packaging.`,
        },
        {
          q: "Can I exchange an item for a different size or colour?",
          a: `Yes. Contact our support team within ${c.exchangeDays} days of receiving your order and we will guide you through the exchange, subject to stock availability.`,
        },
        {
          q: "How do refunds work?",
          a: "After we receive and inspect your returned item, we tell you whether the refund is approved. Approved refunds go to your original payment method and do not include the original shipping cost. Returns and exchanges are processed within 5 business days of receiving the item.",
        },
        {
          q: "Who pays for return shipping?",
          a: "You pay return shipping unless the return is due to our error, such as a wrong or defective item. In that case we provide a prepaid return shipping label.",
        },
        {
          q: "Which items cannot be returned?",
          a: "Gift cards, personalised or custom-made items, and dresses that have been worn cannot be returned.",
        },
        {
          q: "What if my order arrives damaged or defective?",
          a: "Contact us immediately. We will arrange a replacement or a refund, depending on your preference and availability.",
        },
      ],
    },
  ];
};

export const buildFaqSchema = (groups = buildFaqGroups()) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: groups
    .flatMap((g) => g.items)
    .map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
});

// Defaults only (build-time prerender)
export const FAQ_GROUPS = buildFaqGroups();
export const ALL_FAQS = FAQ_GROUPS.flatMap((g) => g.items);
