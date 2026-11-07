import { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "./ProductItem";

const SpecialOffers = () => {
  const { products } = useContext(ShopContext);
  const offers = useMemo(
    () => products.filter((p) => p.discount > 0 && p.stockStatus !== "Out of Stock").sort((a, b) => b.discount - a.discount).slice(0, 5),
    [products],
  );
  if (!offers.length) return null;

  return (
    <section className="container-x py-10 md:py-14 border-t border-stone/60">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-display text-4xl">Special Offers</h2>
          <p className="mt-2 text-sm text-ink/70">Our biggest savings right now.</p>
        </div>
        <Link to="/collection?offers=1" className="btn-link hidden sm:block">View all offers</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 gap-y-8">
        {offers.map((p) => (
          <ProductItem key={p._id} id={p._id} name={p.name} image={p.image} price={p.price} stockStatus={p.stockStatus} discount={p.discount} />
        ))}
      </div>
    </section>
  );
};

export default SpecialOffers;
