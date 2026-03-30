import React, { useContext, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import WishlistSkeleton from "../components/WishlistSkeleton";

const Wishlist = () => {
  const { products, wishlistItems, navigate, isProductsLoading } = useContext(ShopContext);

  const wishlistProducts = useMemo(
    () => products.filter((product) => Boolean(wishlistItems?.[product._id])),
    [products, wishlistItems],
  );

  if (isProductsLoading) {
    return <WishlistSkeleton />;
  }

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-6">
        <Title text1={"MY"} text2={"WISHLIST"} />
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-14 border border-gray-200 rounded">
          <p className="text-gray-700">Your wishlist is empty</p>
          <p className="text-sm text-gray-500 mt-2">
            Tap the heart icon on any product to save it here.
          </p>
          <button
            onClick={() => navigate("/collection")}
            className="bg-black text-white px-6 py-3 text-sm mt-6"
          >
            RETURN TO SHOP
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 gap-y-6">
          {wishlistProducts.map((item) => (
            <ProductItem
              key={item._id}
              name={item.name}
              id={item._id}
              image={item.image}
              price={item.price}
              stockStatus={item.stockStatus}
              discount={item.discount}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
