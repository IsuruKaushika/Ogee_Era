// Google Analytics 4 + Meta Pixel. Both are optional: set VITE_GA_ID and/or VITE_META_PIXEL_ID
// at build time. With neither set, every function here is a harmless no-op.
const GA_ID = import.meta.env.VITE_GA_ID;
const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;
let started = false;

export const initAnalytics = () => {
  if (started || typeof window === "undefined") return;
  started = true;

  if (GA_ID) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { send_page_view: false });
  }

  if (PIXEL_ID) {
    /* eslint-disable */
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */
    window.fbq("init", PIXEL_ID);
  }
};

const toItems = (items = []) =>
  items.map((i) => ({
    item_id: i._id || i.id,
    item_name: i.name,
    price: Number(i.price) || 0,
    quantity: i.quantity || 1,
    item_variant: i.size,
  }));

export const trackPageView = (path) => {
  window.gtag?.("event", "page_view", { page_path: path, page_location: window.location.href });
  window.fbq?.("track", "PageView");
};

export const trackViewItem = (p, price) => {
  window.gtag?.("event", "view_item", { currency: "LKR", value: price, items: toItems([p]) });
  window.fbq?.("track", "ViewContent", {
    content_ids: [p._id],
    content_name: p.name,
    content_type: "product",
    value: price,
    currency: "LKR",
  });
};

export const trackAddToCart = (p, size, price) => {
  window.gtag?.("event", "add_to_cart", {
    currency: "LKR",
    value: price,
    items: toItems([{ ...p, size, quantity: 1 }]),
  });
  window.fbq?.("track", "AddToCart", {
    content_ids: [p._id],
    content_name: p.name,
    content_type: "product",
    value: price,
    currency: "LKR",
  });
};

export const trackBeginCheckout = (items, value) => {
  window.gtag?.("event", "begin_checkout", { currency: "LKR", value, items: toItems(items) });
  window.fbq?.("track", "InitiateCheckout", { value, currency: "LKR", num_items: items.length });
};

export const trackPurchase = ({ orderId, value, method, items = [] }) => {
  window.gtag?.("event", "purchase", {
    transaction_id: orderId,
    currency: "LKR",
    value,
    payment_type: method,
    items: toItems(items),
  });
  window.fbq?.("track", "Purchase", { value, currency: "LKR" });
};
