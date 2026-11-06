import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { trackPurchase } from "../utils/analytics";

// PayHere returns the customer here after card payment (works for guests too).
const PaymentSuccess = () => {
  const { setCartItems, token } = useContext(ShopContext);

  useEffect(() => {
    setCartItems({});
    try {
      const raw = sessionStorage.getItem("lastPayHereOrder");
      if (raw) {
        const o = JSON.parse(raw);
        trackPurchase({ orderId: o.orderId, value: o.value, method: "PayHere", items: o.items });
        sessionStorage.removeItem("lastPayHereOrder");
      }
    } catch {
      /* analytics must never break the page */
    }
  }, []);

  return (
    <div className="py-16 md:py-24 max-w-xl mx-auto text-center">
      <p className="text-xs tracking-[0.2em] uppercase text-taupe">Payment received</p>
      <h1 className="text-5xl mt-3">Thank you for your order</h1>
      <p className="mt-4 text-ink/75 leading-relaxed">
        Your payment was successful. A confirmation email is on its way and we&apos;ll contact you to arrange delivery.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link to="/collection" className="btn-dark">Continue shopping</Link>
        {token && <Link to="/orders" className="btn-outline">View my orders</Link>}
      </div>
    </div>
  );
};

export default PaymentSuccess;
