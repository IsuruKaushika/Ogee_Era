import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

export const Stars = ({ value = 5, size = "text-sm" }) => (
  <span className={`${size} tracking-widest text-ink`} aria-label={`${value} out of 5 stars`}>
    {"★".repeat(Math.round(value))}
    <span className="text-stone">{"★".repeat(5 - Math.round(value))}</span>
  </span>
);

// Homepage testimonials. Shows only real, admin-approved reviews; renders nothing until there are some.
const CustomerReviews = () => {
  const { backendUrl, products } = useContext(ShopContext);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    let live = true;
    axios
      .get(`${backendUrl}/api/review/latest`)
      .then((r) => live && r.data.success && setReviews(r.data.reviews.slice(0, 3)))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [backendUrl]);

  if (!reviews.length) return null;

  return (
    <section className="container-x py-10 md:py-14 border-t border-stone/60">
      <h2 className="font-display text-4xl text-center mb-10">What Our Customers Say</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {reviews.map((r) => {
          const product = products.find((p) => p._id === r.productId);
          return (
            <figure key={r._id} className="text-center md:text-left">
              <Stars value={r.rating} />
              <blockquote className="mt-3 text-[15px] leading-relaxed text-ink/85">&ldquo;{r.comment}&rdquo;</blockquote>
              <figcaption className="mt-3 text-sm text-taupe">
                &mdash; {r.name}
                {r.verifiedBuyer && <span className="ml-2 text-[11px] uppercase tracking-wider">Verified buyer</span>}
                {product && (
                  <>
                    {" "}
                    on <Link className="underline" to={`/product/${product._id}`}>{product.name}</Link>
                  </>
                )}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
};

export default CustomerReviews;
