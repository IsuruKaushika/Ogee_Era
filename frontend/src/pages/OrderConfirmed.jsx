import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { formatPrice } from "../utils/format";
import { useSettings } from "../context/SettingsContext";

// Shown after a cash-on-delivery order (works for guests and logged-in customers)
const OrderConfirmed = () => {
  const { state } = useLocation();
  const { token } = useContext(ShopContext);
  const { business } = useSettings();

  if (!state?.orderId) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-4xl">Thank you</h1>
        <p className="mt-3 text-ink/70">If you just placed an order, check your email for the confirmation.</p>
        <Link to="/collection" className="btn-dark mt-8">Continue shopping</Link>
      </div>
    );
  }

  const ref = String(state.orderId).slice(-8).toUpperCase();
  const wa = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(`Hi ${business.name}, my order reference is ${ref}.`)}`;

  return (
    <div className="py-16 md:py-24 max-w-xl mx-auto text-center">
      <p className="text-xs tracking-[0.2em] uppercase text-taupe">Order placed</p>
      <h1 className="text-5xl mt-3">Thank you{state.name ? `, ${state.name}` : ""}</h1>
      <p className="mt-4 text-ink/75 leading-relaxed">
        We&apos;ve received your order and sent a confirmation to <b>{state.email}</b>. We&apos;ll contact you on your mobile number to confirm delivery.
      </p>
      <div className="mt-8 bg-white border border-stone/60 p-6 text-sm text-left space-y-2">
        <div className="flex justify-between"><span className="text-ink/60">Order reference</span><span className="font-medium">{ref}</span></div>
        <div className="flex justify-between"><span className="text-ink/60">Payment</span><span>{state.method}</span></div>
        <div className="flex justify-between"><span className="text-ink/60">Amount to pay on delivery</span><span className="font-medium">{formatPrice(state.amount)}</span></div>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link to="/collection" className="btn-dark">Continue shopping</Link>
        {token ? <Link to="/orders" className="btn-outline">View my orders</Link> : business.whatsapp && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-outline">Track on WhatsApp</a>}
      </div>
    </div>
  );
};

export default OrderConfirmed;
