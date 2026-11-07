import { Link } from "react-router-dom";
import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { formatPrice, finalPrice } from "../utils/format";

const cld = (url, fmt) => url.replace("/upload/", `/upload/${fmt},q_auto,w_640,c_limit/`);

const ProductItem = ({ id, image, name, price, stockStatus, discount }) => {
  const { isInWishlist, toggleWishlist } = useContext(ShopContext);
  const soldOut = stockStatus === "Out of Stock";
  const now = finalPrice({ price, discount });

  return (
    <Link className="group block text-ink" to={`/product/${id}`}>
      <div className="relative overflow-hidden bg-sand">
        <picture>
          <source srcSet={cld(image[0], "f_avif")} type="image/avif" />
          <source srcSet={cld(image[0], "f_webp")} type="image/webp" />
          <img
            className={`aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-105 ${soldOut ? "opacity-60" : ""}`}
            src={cld(image[0], "f_auto")}
            alt={name}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        </picture>

        {discount > 0 && !soldOut && (
          <span className="absolute top-2 left-2 bg-ink text-white text-[11px] tracking-wide px-2 py-1">-{discount}%</span>
        )}
        {soldOut && (
          <span className="absolute bottom-2 left-2 bg-white/90 text-ink text-[11px] tracking-wider px-2 py-1">SOLD OUT</span>
        )}
        {stockStatus === "Limited Stock" && (
          <span className="absolute bottom-2 left-2 bg-white/90 text-[#9a4a12] text-[11px] tracking-wider px-2 py-1">ONLY A FEW LEFT</span>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(id);
          }}
          className="absolute top-2 right-2 z-10 p-1"
          aria-label={isInWishlist(id) ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isInWishlist(id) ? <GoHeartFill className="text-ink text-lg" /> : <GoHeart className="text-ink/80 text-lg" />}
        </button>
      </div>

      <div className="pt-3">
        <p className="text-[13px] sm:text-sm leading-snug line-clamp-2">{name}</p>
        <p className="mt-1 text-[13px] sm:text-sm">
          {discount > 0 ? (
            <>
              <span className="font-medium">{formatPrice(now)}</span>
              <span className="ml-2 line-through text-taupe">{formatPrice(price)}</span>
            </>
          ) : (
            <span>{formatPrice(price)}</span>
          )}
        </p>
      </div>
    </Link>
  );
};

export default ProductItem;
