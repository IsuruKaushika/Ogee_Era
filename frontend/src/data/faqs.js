// Single source of truth for FAQ content. Used by the FAQ page, the Contact page,
// FAQPage structured data and scripts/prerender.mjs (keep this file plain ESM, no JSX).
export const FAQ_GROUPS = [
  {
    title: "About OgeeEra",
    items: [
      {
        q: "What is OgeeEra?",
        a: "OgeeEra (ogeeera.lk) is a Sri Lankan online fashion store selling clothing for women, men and kids. You can order online with secure checkout and islandwide delivery.",
      },
      {
        q: "How can I contact OgeeEra?",
        a: "Email ogeeeraa@gmail.com, call or WhatsApp +94 71 220 5395, or use the contact form on the Contact page. Working hours are Monday to Friday 9:00 AM - 6:00 PM, Saturday 9:00 AM - 4:00 PM, and closed on Sunday.",
      },
    ],
  },
  {
    title: "Ordering & payment",
    items: [
      {
        q: "How do I place an order?",
        a: "Browse the collection, choose your size and add items to your cart, then go to checkout. You can create an account or check out as a guest. Your order is confirmed once you receive the confirmation email.",
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
      {
        q: "Do you deliver islandwide in Sri Lanka?",
        a: "Yes. OgeeEra delivers to addresses across Sri Lanka.",
      },
      {
        q: "How much is delivery?",
        a: "A delivery fee of Rs. 400 is added to your order at checkout.",
      },
      {
        q: "How can I track my order?",
        a: "You receive an order confirmation email after you order. If you have an account, you can also see your orders and their status on the My Orders page.",
      },
    ],
  },
  {
    title: "Returns, exchanges & refunds",
    items: [
      {
        q: "What is your return policy?",
        a: "We accept returns within 7 days of your purchase date. Items must be unused, in original condition and in their original packaging.",
      },
      {
        q: "Can I exchange an item for a different size or colour?",
        a: "Yes. Contact our support team within 3 days of receiving your order and we will guide you through the exchange.",
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

export const ALL_FAQS = FAQ_GROUPS.flatMap((g) => g.items);

export const buildFaqSchema = (items = ALL_FAQS) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});
