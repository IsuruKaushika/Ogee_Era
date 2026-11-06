import { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { FiTrash2, FiMinus, FiPlus } from "react-icons/fi";
import { ShopContext } from "../context/ShopContext";
import CartTotal from "../components/CartTotal";
import CartSkeleton from "../components/CartSkeleton";
import { formatPrice, finalPrice } from "../utils/format";
import { trackBeginCheckout } from "../utils/analytics";

const thumb = (u) => u?.replace("/upload/", "/upload/f_auto,q_auto,w_200,c_limit/");

const Cart = () => {
  const { products, isProductsLoading, cartItems, updateQuantity, navigate, token, getCartTotal } = useContext(ShopContext);

  const lines = useMemo(() => {
    const out = [];
    for (const id in cartItems) {
      const product = products.find((p) => p._id === id);
      if (!product) continue;
      for (const size in cartItems[id]) {
        const quantity = cartItems[id][size];
        if (quantity > 0) out.push({ product, size, quantity });
      }
    }
    return out;
  }, [cartItems, products]);

  if (isProductsLoading) return <CartSkeleton />;

  const hasSoldOut = lines.some((l) => l.product.stockStatus === "Out of Stock");

  const checkout = () => {
    trackBeginCheckout(lines.map((l) => ({ ...l.product, size: l.size, quantity: l.quantity })), getCartTotal());
    navigate("/place-order");
  };

  if (lines.length === 0) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-4xl">Your cart is empty</h1>
        <p className="mt-3 text-ink/70">Find something you love in our latest arrivals.</p>
        <Link to="/collection" className="btn-dark mt-8">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12">
      <h1 className="text-4xl md:text-5xl mb-8">Your Cart</h1>
      <div className="grid lg:grid-cols-[1fr_380px] gap-10 lg:gap-14">
        <ul className="divide-y divide-stone/60 border-y border-stone/60">
          {lines.map(({ product, size, quantity }) => {
            const unit = finalPrice(product);
            const soldOut = product.stockStatus === "Out of Stock";
            return (
              <li key={`${product._id}-${size}`} className="py-5 flex gap-4">
                <Link to={`/product/${product._id}`} className="shrink-0">
                  <img src={thumb(product.image[0])} alt={product.name} className="w-24 sm:w-28 aspect-[3/4] object-cover bg-sand" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-3">
                    <div>
                      <Link to={`/product/${product._id}`} className="font-display text-xl leading-tight">{product.name}</Link>
                      {size !== "default" && <p className="mt-1 text-sm text-ink/65">Size: {size}</p>}
                      {soldOut && <p className="mt-1 text-sm text-red-700">Sold out. Remove to continue.</p>}
                    </div>
                    <p className="text-sm font-medium whitespace-nowrap">{formatPrice(unit * quantity)}</p>
                  </div>
                  <p className="mt-1 text-sm text-ink/65">
                    {formatPrice(unit)} each{product.discount > 0 && <span className="ml-2 line-through text-taupe">{formatPrice(product.price)}</span>}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="inline-flex items-center border border-stone bg-white">
                      <button className="p-2.5" aria-label="Decrease quantity" onClick={() => updateQuantity(product._id, size, Math.max(1, quantity - 1))}><FiMinus className="w-3.5 h-3.5" /></button>
                      <span className="w-9 text-center text-sm" aria-live="polite">{quantity}</span>
                      <button className="p-2.5" aria-label="Increase quantity" onClick={() => updateQuantity(product._id, size, quantity + 1)}><FiPlus className="w-3.5 h-3.5" /></button>
                    </div>
                    <button className="p-2 text-ink/60 hover:text-ink" aria-label={`Remove ${product.name}`} onClick={() => updateQuantity(product._id, size, 0)}><FiTrash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="lg:sticky lg:top-24 self-start bg-white border border-stone/60 p-6">
          <CartTotal />
          <button onClick={checkout} disabled={hasSoldOut} className="btn-dark w-full mt-6">Proceed to checkout</button>
          <p className="mt-3 text-xs text-center text-ink/60">
            No account needed. {!token && <Link to="/login" className="underline">Log in</Link>}{!token && " to use your saved details."}
          </p>
          <Link to="/collection" className="block mt-4 text-center btn-link">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
