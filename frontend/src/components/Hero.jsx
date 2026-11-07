import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { useSettings } from "../context/SettingsContext";
import { soldOutLast, formatPrice, finalPrice } from "../utils/format";

const img = (url, w = 1400) => url?.replace("/upload/", `/upload/f_auto,q_auto,w_${w},c_limit/`);

// Internal paths use <Link>, full URLs a normal anchor
const Cta = ({ to, className, children, ...rest }) =>
  /^https?:\/\//i.test(to || "") ? (
    <a href={to} className={className} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>
  ) : (
    <Link to={to || "/collection"} className={className} {...rest}>{children}</Link>
  );

// Hero banner that loops through slides, each with its own picture and quote.
//  - Slides uploaded in admin > Promotions are shown exactly as set.
//  - Otherwise the slides are your popular (best-selling) products, one per slide, and the quotes
//    from admin > Promotions are shown in turn, so the text changes with every picture.
const Hero = () => {
  const { products, isProductsLoading } = useContext(ShopContext);
  const { hero } = useSettings();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides = useMemo(() => {
    if (hero.slides.length) {
      return hero.slides.map((s, idx) => ({
        key: `s${idx}`, src: s.image, alt: s.title || hero.headline,
        title: s.title || hero.headline, subtitle: s.subtitle || hero.subtext,
        ctaLabel: s.ctaLabel || hero.primaryLabel, ctaLink: s.ctaLink || hero.primaryLink,
      }));
    }
    const popular = products.filter((p) => p.bestseller && p.image?.[0] && p.stockStatus !== "Out of Stock");
    const pool = (popular.length >= 2 ? popular : soldOutLast(products).filter((p) => p.image?.[0])).slice(0, 6);
    const quotes = hero.quotes.length ? hero.quotes : [{ title: hero.headline, subtitle: hero.subtext }];
    return pool.map((p, idx) => {
      const q = quotes[idx % quotes.length];
      return {
        key: p._id, src: img(p.image[0]), alt: p.name, title: q.title, subtitle: q.subtitle,
        ctaLabel: hero.productCtaLabel || "Shop this piece", ctaLink: `/product/${p._id}`,
        caption: `${p.name} · ${formatPrice(finalPrice(p))}`,
      };
    });
  }, [products, hero]);

  useEffect(() => setI(0), [slides.length]);
  useEffect(() => {
    if (slides.length < 2 || paused) return undefined;
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [slides.length, paused]);

  const cur = slides[i] || { title: hero.headline, subtitle: hero.subtext, ctaLabel: hero.primaryLabel, ctaLink: hero.primaryLink };
  const prev = () => setI((n) => (n - 1 + slides.length) % slides.length);
  const next = () => setI((n) => (n + 1) % slides.length);

  return (
    <section
      className="relative bg-sand overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured products"
    >
      <div className="container-x grid md:grid-cols-2 items-center min-h-[480px] md:min-h-[580px] gap-6 py-10 md:py-0">
        {/* Text: re-mounted on every slide so it fades in with the new quote */}
        <div className="order-2 md:order-1 md:pr-10 z-10" aria-live="polite">
          <div key={cur.key || "static"} className="hero-text-in">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl leading-[1.02] font-display">{cur.title}</h1>
            {cur.subtitle && <p className="mt-5 text-[15px] text-ink/75 max-w-sm leading-relaxed">{cur.subtitle}</p>}
            <div className="mt-8 flex flex-wrap items-center gap-6">
              {cur.ctaLabel && <Cta to={cur.ctaLink} className="btn-dark">{cur.ctaLabel}</Cta>}
              {!hero.slides.length && (
                <Link to={hero.primaryLink || "/collection"} className="btn-link">
                  {hero.primaryLabel || "Shop New Arrivals"} &rarr;
                </Link>
              )}
            </div>
            {cur.caption && <p className="mt-6 text-xs tracking-wide text-taupe">{cur.caption}</p>}
          </div>
        </div>

        {/* Pictures cross-fade */}
        <div className="order-1 md:order-2 relative h-[380px] sm:h-[460px] md:h-[580px]">
          {isProductsLoading && !hero.slides.length && <div className="absolute inset-0 bg-stone/50 animate-pulse" />}
          {slides.map((s, idx) => (
            <Cta
              key={s.key}
              to={s.ctaLink}
              tabIndex={idx === i ? 0 : -1}
              aria-hidden={idx !== i}
              className={`absolute inset-0 transition-opacity duration-1000 ${idx === i ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <img
                src={s.src}
                alt={s.alt}
                className={`w-full h-full object-cover object-top transition-transform duration-[6000ms] ease-out ${idx === i ? "scale-105" : "scale-100"}`}
                loading={idx === 0 ? "eager" : "lazy"}
                fetchPriority={idx === 0 ? "high" : "auto"}
              />
            </Cta>
          ))}

          {slides.length > 1 && (
            <>
              <button onClick={prev} aria-label="Previous slide" className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-lg">‹</button>
              <button onClick={next} aria-label="Next slide" className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-lg">›</button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((s, idx) => (
                  <button
                    key={s.key}
                    onClick={() => setI(idx)}
                    aria-label={`Show slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6 bg-ink" : "w-1.5 bg-ink/40"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
