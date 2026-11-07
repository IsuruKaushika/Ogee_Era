import { useContext, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "./ProductItem";
import ProductGridSkeleton from "./ProductGridSkeleton";

const BestSeller = () => {
  const { products, isProductsLoading } = useContext(ShopContext);
  const best = useMemo(() => products.filter((p) => p.bestseller && p.stockStatus !== "Out of Stock").slice(0, 5), [products]);
  if (!isProductsLoading && best.length === 0) return null;

  return (
    <section className="container-x py-10 md:py-14 border-t border-stone/60">
      <div className="text-center mb-8">
        <h2 className="font-display text-4xl">Best Sellers</h2>
        <p className="mt-2 text-sm text-ink/70">Customer favourites, timeless styles.</p>
      </div>
      {isProductsLoading ? (
        <ProductGridSkeleton count={5} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 gap-y-8">
          {best.map((p) => (
            <ProductItem key={p._id} id={p._id} name={p.name} image={p.image} price={p.price} stockStatus={p.stockStatus} discount={p.discount} />
          ))}
        </div>
      )}
    </section>
  );
};

export default BestSeller;
