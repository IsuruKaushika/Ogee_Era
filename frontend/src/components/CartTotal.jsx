import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { formatPrice } from "../utils/format";

// Totals shown to the customer. The server re-calculates the final amount when the order is placed.
const CartTotal = () => {
  const { getCartAmount, getCartDiscount, getCartNetSubtotal, getDeliveryFee, getCartTotal, free_delivery_threshold } = useContext(ShopContext);
  const net = getCartNetSubtotal();
  const delivery = getDeliveryFee();
  const remaining = free_delivery_threshold - net;
  const progress = Math.min(100, Math.max(0, (net / free_delivery_threshold) * 100));

  return (
    <div className="w-full text-sm">
      <h2 className="text-2xl mb-4">Order Summary</h2>

      {free_delivery_threshold > 0 && net > 0 && (
        <div className="mb-5">
          <p className="text-xs text-ink/75">
            {remaining > 0 ? <>Add <b>{formatPrice(remaining)}</b> more for free delivery</> : <b>You&apos;ve unlocked free delivery</b>}
          </p>
          <div className="mt-2 h-1 bg-sand"><div className="h-1 bg-ink transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(Number(getCartAmount()))}</span></div>
        {Number(getCartDiscount()) > 0 && (
          <div className="flex justify-between text-green-800"><span>Discount</span><span>- {formatPrice(Number(getCartDiscount()))}</span></div>
        )}
        <div className="flex justify-between"><span>Delivery</span><span>{net <= 0 ? "-" : delivery === 0 ? "Free" : formatPrice(delivery)}</span></div>
        <div className="flex justify-between border-t border-stone/60 pt-3 text-base font-medium"><span>Total</span><span>{formatPrice(getCartTotal())}</span></div>
      </div>
    </div>
  );
};

export default CartTotal;
