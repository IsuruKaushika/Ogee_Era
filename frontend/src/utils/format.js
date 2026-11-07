// "Rs. 5,432" (no trailing .00 on whole rupees)
export const formatPrice = (value, currency = "Rs.") => {
  const n = Number(value) || 0;
  const hasCents = Math.abs(n - Math.round(n)) > 0.004;
  return `${currency} ${n.toLocaleString("en-LK", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
};

export const finalPrice = (product) =>
  product?.discount ? product.price * (1 - product.discount / 100) : product?.price || 0;

export const isSoldOut = (p) => p?.stockStatus === "Out of Stock";

// Available items first, sold-out items last (keeps the original order otherwise)
export const soldOutLast = (list) => [...list].sort((a, b) => Number(isSoldOut(a)) - Number(isSoldOut(b)));
