import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { soldOutLast } from "../utils/format";

const img = (url, w = 1200) => url?.replace("/upload/", `/upload/f_auto,q_auto,w_${w},c_limit/`);

const Hero = () => {
  const { products, isProductsLoading } = useContext(ShopContext);
  const [i, setI] = useState(0);

  // Feature best sellers; fall back to the newest available products
  const slides = useMemo(() => {
    const best = products.filter((p) => p.bestseller && p.image?.[0] && p.stockStatus !== "Out of Stock");
    const pool = best.length >= 2 ? best : soldOutLast(products).filter((p) => p.image?.[0]);
    return pool.slice(0, 5);
  }, [products]);

  useEffect(() => setI(0), [slides.length]);
  useEffect(() => {
    if (slides.length < 2) return undefined;
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <section className="relative bg-sand overflow-hidden">
      <div className="container-x grid md:grid-cols-2 items-center min-h-[460px] md:min-h-[560px] gap-6 py-10 md:py-0">
        <div className="order-2 md:order-1 md:pr-10 z-10">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl leading-[1.02] font-display">
            Timeless Style.<br />Modern Elegance.
          </h1>
          <p className="mt-5 text-[15px] text-ink/75 max-w-sm leading-relaxed">
            Elevated everyday pieces, designed to make you feel confident. Delivered islandwide across Sri Lanka.
          </p>
          <div className="mt-8 flex items-center gap-6">
            <Link to="/collection" className="btn-dark">Shop New Arrivals</Link>
            <Link to="/collection?offers=1" className="btn-link">Shop the Sale &rarr;</Link>
          </div>
        </div>

        <div className="order-1 md:order-2 relative h-[360px] sm:h-[440px] md:h-[560px]">
          {isProductsLoading && <div className="absolute inset-0 bg-stone/50 animate-pulse" />}
          {slides.map((p, idx) => (
            <Link
              key={p._id}
              to={`/product/${p._id}`}
              aria-hidden={idx !== i}
              tabIndex={idx === i ? 0 : -1}
              className={`absolute inset-0 transition-opacity duration-1000 ${idx === i ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <img
                src={img(p.image[0])}
                alt={p.name}
                className="w-full h-full object-cover object-top"
                loading={idx === 0 ? "eager" : "lazy"}
                fetchpriority={idx === 0 ? "high" : "auto"}
              />
            </Link>
          ))}
          {slides.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setI(idx)}
                  aria-label={`Show slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6 bg-ink" : "w-1.5 bg-ink/40"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
