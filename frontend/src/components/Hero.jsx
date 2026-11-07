import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { useSettings } from "../context/SettingsContext";
import { soldOutLast } from "../utils/format";

const img = (url, w = 1200) => url?.replace("/upload/", `/upload/f_auto,q_auto,w_${w},c_limit/`);

// Internal paths use <Link>, full URLs a normal anchor
const Cta = ({ to, className, children }) =>
  /^https?:\/\//i.test(to || "") ? (
    <a href={to} className={className} target="_blank" rel="noopener noreferrer">{children}</a>
  ) : (
    <Link to={to || "/collection"} className={className}>{children}</Link>
  );

// Hero banner. Slides uploaded in admin > Promotions are shown exactly as set (picture, headline,
// text and button). With no slides it rotates photos of best-selling products under the default headline.
const Hero = () => {
  const { products, isProductsLoading } = useContext(ShopContext);
  const { hero } = useSettings();
  const [i, setI] = useState(0);

  const slides = useMemo(() => {
    if (hero.slides.length) {
      return hero.slides.map((s, idx) => ({
        key: `s${idx}`, src: s.image, alt: s.title || hero.headline, link: s.ctaLink || hero.primaryLink,
        title: s.title || hero.headline, subtitle: s.subtitle || hero.subtext,
        ctaLabel: s.ctaLabel || hero.primaryLabel, ctaLink: s.ctaLink || hero.primaryLink, uploaded: true,
      }));
    }
    const best = products.filter((p) => p.bestseller && p.image?.[0] && p.stockStatus !== "Out of Stock");
    const pool = best.length >= 2 ? best : soldOutLast(products).filter((p) => p.image?.[0]);
    return pool.slice(0, 5).map((p) => ({
      key: p._id, src: img(p.image[0]), alt: p.name, link: `/product/${p._id}`,
      title: hero.headline, subtitle: hero.subtext, ctaLabel: hero.primaryLabel, ctaLink: hero.primaryLink,
    }));
  }, [products, hero]);

  useEffect(() => setI(0), [slides.length]);
  useEffect(() => {
    if (slides.length < 2) return undefined;
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  const cur = slides[i] || { title: hero.headline, subtitle: hero.subtext, ctaLabel: hero.primaryLabel, ctaLink: hero.primaryLink };

  return (
    <section className="relative bg-sand overflow-hidden">
      <div className="container-x grid md:grid-cols-2 items-center min-h-[460px] md:min-h-[560px] gap-6 py-10 md:py-0">
        <div className="order-2 md:order-1 md:pr-10 z-10">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl leading-[1.02] font-display">{cur.title}</h1>
          {cur.subtitle && <p className="mt-5 text-[15px] text-ink/75 max-w-sm leading-relaxed">{cur.subtitle}</p>}
          <div className="mt-8 flex flex-wrap items-center gap-6">
            {cur.ctaLabel && <Cta to={cur.ctaLink} className="btn-dark">{cur.ctaLabel}</Cta>}
            {hero.secondaryLabel && hero.secondaryLink && !hero.slides.length && (
              <Cta to={hero.secondaryLink} className="btn-link">{hero.secondaryLabel} &rarr;</Cta>
            )}
          </div>
        </div>

        <div className="order-1 md:order-2 relative h-[360px] sm:h-[440px] md:h-[560px]">
          {isProductsLoading && !hero.slides.length && <div className="absolute inset-0 bg-stone/50 animate-pulse" />}
          {slides.map((s, idx) => (
            <Cta
              key={s.key}
              to={s.link}
              className={`absolute inset-0 transition-opacity duration-1000 ${idx === i ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <img
                src={s.src}
                alt={s.alt}
                className="w-full h-full object-cover object-top"
                loading={idx === 0 ? "eager" : "lazy"}
                fetchPriority={idx === 0 ? "high" : "auto"}
              />
            </Cta>
          ))}
          {slides.length > 1 && (
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
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
