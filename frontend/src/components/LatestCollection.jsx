import { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "./ProductItem";
import ProductGridSkeleton from "./ProductGridSkeleton";
import { soldOutLast } from "../utils/format";

// "New Arrivals": intro on the left, four newest available pieces on the right
const LatestCollection = () => {
  const { products, isProductsLoading } = useContext(ShopContext);
  const latest = useMemo(() => soldOutLast(products).slice(0, 4), [products]);

  return (
    <section className="container-x py-10 md:py-14 border-t border-stone/60">
      <div className="grid lg:grid-cols-[240px_1fr] gap-8 lg:gap-12">
        <div>
          <h2 className="font-display text-4xl">New Arrivals</h2>
          <p className="mt-3 text-sm text-ink/70 max-w-[220px] leading-relaxed">
            Fresh styles just in. Be the first to shop our latest drops.
          </p>
          <Link to="/collection" className="btn-dark mt-6 hidden lg:inline-block">Shop All</Link>
        </div>
        <div>
          {isProductsLoading ? (
            <ProductGridSkeleton count={4} gridClassName="grid grid-cols-2 md:grid-cols-4 gap-4" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 gap-y-8">
              {latest.map((p) => (
                <ProductItem key={p._id} id={p._id} image={p.image} name={p.name} price={p.price} stockStatus={p.stockStatus} discount={p.discount} />
              ))}
            </div>
          )}
          <Link to="/collection" className="btn-dark mt-8 inline-block lg:hidden">Shop All</Link>
        </div>
      </div>
    </section>
  );
};

export default LatestCollection;
