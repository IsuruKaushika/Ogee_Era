import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

const wide = (u) => u?.replace("/upload/", "/upload/f_auto,q_auto,w_900,c_limit/");

const Wrap = ({ to, className, style, children }) =>
  !to ? (
    <div className={className} style={style}>{children}</div>
  ) : /^https?:\/\//i.test(to) ? (
    <a href={to} className={className} style={style} target="_blank" rel="noopener noreferrer">{children}</a>
  ) : (
    <Link to={to} className={className} style={style}>{children}</Link>
  );

// Promotion banners exactly as configured in admin > Promotions: picture, text, badge, button and colours.
const PromoBanners = () => {
  const { promos } = useSettings();
  const active = promos.filter((p) => p.enabled !== false);
  if (!active.length) return null;

  return (
    <section className="container-x pb-10 md:pb-14">
      <div className={`grid gap-4 ${active.length === 1 ? "" : "md:grid-cols-2"}`}>
        {active.map((p, i) => (
          <Wrap
            key={i}
            to={p.link}
            className="group relative block h-[300px] md:h-[340px] overflow-hidden"
            style={{ backgroundColor: p.bgColor, color: p.textColor }}
          >
            {p.image && (
              <img src={wide(p.image)} alt="" className="absolute right-0 top-0 h-full w-1/2 object-cover object-top group-hover:scale-105 transition duration-700" loading="lazy" />
            )}
            <div className={`absolute inset-y-0 left-0 ${p.image ? "w-1/2" : "w-full"} p-7 md:p-9 flex flex-col justify-center`} style={{ backgroundColor: p.bgColor }}>
              {p.title && <h3 className="font-display text-4xl leading-tight">{p.title}</h3>}
              {p.subtitle && <p className="mt-2 text-sm opacity-80">{p.subtitle}</p>}
              {p.badge && <p className="mt-4 text-xs tracking-[0.16em] uppercase">{p.badge}</p>}
              {p.ctaLabel && <span className="mt-4 text-xs tracking-[0.16em] uppercase">{p.ctaLabel} &rarr;</span>}
            </div>
          </Wrap>
        ))}
      </div>
    </section>
  );
};

export default PromoBanners;
