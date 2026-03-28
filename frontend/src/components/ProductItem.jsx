import React from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { useContext } from "react";
import { GoHeart, GoHeartFill } from "react-icons/go";

const ProductItem = ({ id, image, name, price, stockStatus, discount }) => {
  const { currency, isInWishlist, toggleWishlist } = useContext(ShopContext);

  // Function to determine badge styling for out of stock items
  const getBadgeStyle = () => {
    switch (stockStatus) {
      case "Out of Stock":
        return "bg-gray-500 text-white";
      case "Limited Stock":
        return "bg-orange-500 text-white";
      default:
        return "bg-gray-600 text-white"; // Default to grey if not specified
    }
  };

  return (
    <Link className="text-gray-700 cursor-pointer" to={`/product/${id}`}>
      <div className="overflow-hidden relative">
        <picture>
          <source
            srcSet={`${image[0].replace("/upload/", "/upload/f_avif,q_auto,w_640,c_limit/")}`}
            type="image/avif"
          />
          <source
            srcSet={`${image[0].replace("/upload/", "/upload/f_webp,q_auto,w_640,c_limit/")}`}
            type="image/webp"
          />
          <img
            className="hover:scale-110 transition ease-in-out aspect-[2/3] w-full object-cover"
            src={image[0].replace(
              "/upload/",
              "/upload/f_auto,q_auto,w_640,c_limit/",
            )}
            alt={name}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        </picture>
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-0 left-0 m-2 font-inter">
            <span className="text-sm font-medium px-2 py-1 inline-block rounded shadow-md bg-gray-900 text-white">
              {discount}% Off
            </span>
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(id);
          }}
          className="absolute top-4 right-4 z-10"
          aria-label={
            isInWishlist(id) ? "Remove from wishlist" : "Add to wishlist"
          }
        >
          {isInWishlist(id) ? (
            <GoHeartFill className="text-black text-xl" />
          ) : (
            <GoHeart className="text-gray-700 text-xl" />
          )}
        </button>

        {/* Stock Status Label - Bottom Left Corner of Image */}
        {(stockStatus === "Out of Stock" ||
          stockStatus === "Limited Stock") && (
          <div className="absolute bottom-0 left-0 m-2">
            <span
              className={`text-xs font-medium px-2 py-1 inline-block rounded shadow-md ${getBadgeStyle()}`}
            >
              {stockStatus === "Out of Stock" ? "SOLD OUT" : stockStatus}
            </span>
          </div>
        )}

        {/* Add to Cart button - Bottom Right Corner */}
        <div className="absolute bottom-2 right-2 z-10"></div>
      </div>
      <div className="flex flex-col justify-between items-start pt-3 pb-1">
        <p className="text-md">{name}</p>
        <div className="text-md font-medium">
          {discount > 0 ? (
            <div className="flex items-center gap-2">
              <span className="font-bold">
                {currency}
                {(price * (1 - discount / 100)).toFixed(2)}
              </span>
              <span className="line-through text-gray-500">
                {currency}
                {price}
              </span>
            </div>
          ) : (
            <span>
              {currency}
              {price}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductItem;
