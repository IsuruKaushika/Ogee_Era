// Shop-wide commercial rules. Keep in sync with frontend/src/config/site.js.
export const DELIVERY_FEE = 400;
// Orders at or above this subtotal (after discounts) ship free. Set to 0 to disable.
export const FREE_DELIVERY_THRESHOLD = 7500;
export const LIMITED_STOCK_AT = 3;

export const deliveryFeeFor = (subtotal) =>
  FREE_DELIVERY_THRESHOLD > 0 && subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;

export const statusFromStock = (stock) =>
  stock <= 0 ? "Out of Stock" : stock <= LIMITED_STOCK_AT ? "Limited Stock" : "In Stock";
