import { useContext, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "./ProductItem";
import ProductGridSkeleton from "./ProductGridSkeleton";
import Title from "./Title";
import { soldOutLast } from "../utils/format";

const RelatedProducts = ({ category, subCategory, excludeId }) => {
  const { products, isProductsLoading } = useContext(ShopContext);
  const related = useMemo(
    () => soldOutLast(products.filter((p) => p._id !== excludeId && p.category === category && p.subCategory === subCategory)).slice(0, 5),
    [products, category, subCategory, excludeId],
  );
  if (!isProductsLoading && related.length === 0) return null;

  return (
    <section className="mt-16 border-t border-stone/60 pt-10">
      <div className="text-center mb-8">
        <Title text1="You may" text2="also like" />
      </div>
      {isProductsLoading ? (
        <ProductGridSkeleton count={5} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 gap-y-8">
          {related.map((p) => (
            <ProductItem key={p._id} id={p._id} name={p.name} price={p.price} image={p.image} discount={p.discount} stockStatus={p.stockStatus} />
          ))}
        </div>
      )}
    </section>
  );
};

export default RelatedProducts;
