// Stock rules. Delivery fee, free-delivery level and return window are edited in the admin
// panel (Settings) and read through config/settings.js.
export const LIMITED_STOCK_AT = 3;

export const statusFromStock = (stock) =>
  stock <= 0 ? "Out of Stock" : stock <= LIMITED_STOCK_AT ? "Limited Stock" : "In Stock";
