import { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import { validatePlaceOrderForm, normalizePhone } from "../utils/validatePlaceOrderForm";
import PlaceOrderSkeleton from "../components/PlaceOrderSkeleton";
import CartTotal from "../components/CartTotal";
import { SRI_LANKA_DISTRICTS } from "../config/site";
import { formatPrice, finalPrice } from "../utils/format";
import { trackPurchase } from "../utils/analytics";

const thumb = (u) => u?.replace("/upload/", "/upload/f_auto,q_auto,w_120,c_limit/");

const Field = ({ label, error, children }) => (
  <label className="block">
    <span className="block text-xs text-ink/70 mb-1">{label}</span>
    {children}
    {error && <span className="block text-xs text-red-700 mt-1">{error}</span>}
  </label>
);

const PlaceOrder = () => {
  const { navigate, backendUrl, token, cartItems, setCartItems, products, isProductsLoading, getCartTotal } = useContext(ShopContext);
  const [method, setMethod] = useState("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", street: "", city: "", state: "", zipcode: "", country: "Sri Lanka",
  });

  const orderItems = useMemo(() => {
    const out = [];
    for (const id in cartItems) {
      const product = products.find((p) => p._id === id);
      if (!product) continue;
      for (const size in cartItems[id]) {
        if (cartItems[id][size] > 0) out.push({ ...product, size, quantity: cartItems[id][size] });
      }
    }
    return out;
  }, [cartItems, products]);

  if (isProductsLoading) return <PlaceOrderSkeleton />;

  if (orderItems.length === 0) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-4xl">Your cart is empty</h1>
        <Link to="/collection" className="btn-dark mt-8">Shop now</Link>
      </div>
    );
  }

  const set = (e) => setFormData((d) => ({ ...d, [e.target.name]: e.target.value }));
  const cls = (name) => `field ${errors[name] ? "!border-red-500" : ""}`;

  const startPayHere = (orderId, res) => {
    const f = document.createElement("form");
    f.method = "POST";
    f.action = res.sandbox ? "https://sandbox.payhere.lk/pay/checkout" : "https://www.payhere.lk/pay/checkout";
    const fields = {
      merchant_id: res.merchantId,
      return_url: `${window.location.origin}/payment-success`,
      cancel_url: `${window.location.origin}/payment-failed?order_id=${orderId}`,
      notify_url: `${backendUrl}/api/order/payhere-notify`,
      order_id: orderId,
      items: orderItems.map((i) => `${i.name} (${i.size})`).join(", ").slice(0, 250),
      amount: Number(res.amount).toFixed(2), // server-calculated; must match the hash
      currency: "LKR",
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: normalizePhone(formData.phone),
      address: formData.street,
      city: formData.city,
      country: "Sri Lanka",
      hash: res.hash,
    };
    Object.entries(fields).forEach(([k, v]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = k;
      input.value = v;
      f.appendChild(input);
    });
    document.body.appendChild(f);
    f.submit();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const { isValid, errors: v } = await validatePlaceOrderForm(formData);
    if (!isValid) {
      setErrors(v);
      toast.error("Please check the highlighted fields.");
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    // Only ids, sizes and quantities are sent. The server looks up prices and calculates the total.
    const payload = {
      address: { ...formData, phone: normalizePhone(formData.phone), country: "Sri Lanka" },
      items: orderItems.map((i) => ({ _id: i._id, size: i.size, quantity: i.quantity })),
    };
    const headers = token ? { token } : {};
    const summary = { value: getCartTotal(), items: orderItems };

    try {
      if (method === "cod") {
        const { data } = await axios.post(`${backendUrl}/api/order/place`, payload, { headers });
        if (data.success) {
          trackPurchase({ orderId: data.orderId, value: data.amount, method: "COD", items: summary.items });
          setCartItems({});
          navigate("/order-confirmed", {
            state: { orderId: data.orderId, amount: data.amount, email: formData.email, name: formData.firstName, method: "Cash on Delivery" },
          });
        } else toast.error(data.message);
      } else {
        const { data } = await axios.post(`${backendUrl}/api/order/create-pending`, payload, { headers });
        if (data.success) {
          sessionStorage.setItem("lastPayHereOrder", JSON.stringify({ orderId: data.orderId, value: data.amount, items: summary.items.map((i) => ({ _id: i._id, name: i.name, price: finalPrice(i), quantity: i.quantity, size: i.size })) }));
          startPayHere(data.orderId, data);
        } else toast.error(data.message || "Could not start payment");
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const Option = ({ id, title, text }) => (
    <button type="button" onClick={() => setMethod(id)} className={`w-full text-left border p-4 flex items-start gap-3 ${method === id ? "border-ink bg-white" : "border-stone"}`} aria-pressed={method === id}>
      <span className={`mt-1 w-4 h-4 rounded-full border ${method === id ? "border-ink bg-ink ring-2 ring-white ring-inset" : "border-stone"}`} />
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-ink/65 mt-0.5">{text}</span>
      </span>
    </button>
  );

  return (
    <form onSubmit={onSubmit} className="py-8 md:py-12" noValidate>
      <h1 className="text-4xl md:text-5xl mb-2">Checkout</h1>
      <p className="text-sm text-ink/70 mb-8">
        Checking out as a guest. {!token && <>Have an account? <Link to="/login" className="underline">Log in</Link>.</>}
      </p>

      <div className="grid lg:grid-cols-[1fr_400px] gap-10 lg:gap-14">
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl mb-4">Delivery details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="First name" error={errors.firstName}><input className={cls("firstName")} name="firstName" value={formData.firstName} onChange={set} autoComplete="given-name" /></Field>
              <Field label="Last name" error={errors.lastName}><input className={cls("lastName")} name="lastName" value={formData.lastName} onChange={set} autoComplete="family-name" /></Field>
              <Field label="Mobile number (for delivery)" error={errors.phone}><input className={cls("phone")} name="phone" value={formData.phone} onChange={set} inputMode="tel" autoComplete="tel" placeholder="071 220 5395" /></Field>
              <Field label="Email (for order confirmation)" error={errors.email}><input className={cls("email")} type="email" name="email" value={formData.email} onChange={set} autoComplete="email" /></Field>
              <div className="sm:col-span-2">
                <Field label="Address" error={errors.street}><input className={cls("street")} name="street" value={formData.street} onChange={set} autoComplete="street-address" placeholder="House no, street, area" /></Field>
              </div>
              <Field label="City / Town" error={errors.city}><input className={cls("city")} name="city" value={formData.city} onChange={set} autoComplete="address-level2" /></Field>
              <Field label="District" error={errors.state}>
                <select className={cls("state")} name="state" value={formData.state} onChange={set}>
                  <option value="">Select district</option>
                  {SRI_LANKA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Postal code (optional)" error={errors.zipcode}><input className={cls("zipcode")} name="zipcode" value={formData.zipcode} onChange={set} inputMode="numeric" autoComplete="postal-code" /></Field>
              <Field label="Country"><input className="field bg-sand/50" value="Sri Lanka" readOnly /></Field>
            </div>
          </section>

          <section>
            <h2 className="text-2xl mb-4">Payment</h2>
            <div className="space-y-3">
              <Option id="cod" title="Cash on delivery" text="Pay in cash when your order arrives." />
              <Option id="payhere" title="Pay online by card" text="Visa or Mastercard through PayHere, Sri Lanka's secure payment gateway." />
            </div>
          </section>
        </div>

        <aside className="self-start bg-white border border-stone/60 p-6 lg:sticky lg:top-24">
          <ul className="divide-y divide-stone/60 mb-5">
            {orderItems.map((i) => (
              <li key={`${i._id}-${i.size}`} className="py-3 flex gap-3 text-sm">
                <img src={thumb(i.image[0])} alt="" className="w-14 aspect-[3/4] object-cover bg-sand" />
                <div className="flex-1">
                  <p className="leading-snug">{i.name}</p>
                  <p className="text-xs text-ink/60">{i.size !== "default" && `Size ${i.size} · `}Qty {i.quantity}</p>
                </div>
                <p>{formatPrice(finalPrice(i) * i.quantity)}</p>
              </li>
            ))}
          </ul>
          <CartTotal />
          <button type="submit" disabled={isSubmitting} className="btn-dark w-full mt-6">
            {isSubmitting ? "Processing..." : method === "payhere" ? "Pay now" : "Place order"}
          </button>
          <p className="mt-3 text-xs text-center text-ink/60">Returns &amp; exchanges within 7 days. Your details are only used to deliver your order.</p>
        </aside>
      </div>
    </form>
  );
};

export default PlaceOrder;
