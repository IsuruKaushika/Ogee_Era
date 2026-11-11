import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

// Sri Lanka "today" as YYYY-MM-DD
const todayLK = () => new Date(Date.now() + 5.5 * 3600000).toISOString().slice(0, 10);

const untilText = (endDate) => {
  const [y, m, d] = endDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const suffix = d % 10 === 1 && d !== 11 ? "st" : d % 10 === 2 && d !== 12 ? "nd" : d % 10 === 3 && d !== 13 ? "rd" : "th";
  return `Until ${d}${suffix} ${dt.toLocaleString("en-GB", { month: "long", timeZone: "UTC" })}`;
};

// Full-width sale strip above the hero. Everything is editable in admin > Promotions.
const SaleBanner = () => {
  const { saleBanner: b } = useSettings();
  if (!b || !b.enabled || !(b.title || b.badge || b.text)) return null;
  if (b.endDate && todayLK() > b.endDate) return null;

  const Cta = b.link && /^https?:\/\//i.test(b.link) ? "a" : Link;
  const ctaProps = Cta === "a" ? { href: b.link, target: "_blank", rel: "noopener noreferrer" } : { to: b.link || "/collection" };

  return (
    <div style={{ backgroundColor: b.bgColor, color: b.textColor }}>
      <div className="container-x py-3 md:py-4 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-8 text-center">
        <div className="flex items-baseline gap-2 md:gap-3 leading-none">
          {b.badge && <span className="font-sans text-4xl md:text-5xl font-extrabold tracking-tight">{b.badge}</span>}
          {b.title && <span className="text-xl md:text-2xl font-semibold tracking-[0.2em]">{b.title}</span>}
        </div>
        <div className="text-sm md:text-base">
          {b.text && <p className="font-medium">{b.text}</p>}
          {b.endDate && <p className="text-xs md:text-sm opacity-80 mt-0.5">{untilText(b.endDate)}</p>}
        </div>
        {b.ctaLabel && (
          <Cta
            {...ctaProps}
            className="shrink-0 px-6 py-2 rounded-full bg-white text-xs md:text-sm font-semibold tracking-[0.14em] uppercase hover:opacity-90 transition"
            style={{ color: b.bgColor }}
          >
            {b.ctaLabel}
          </Cta>
        )}
      </div>
    </div>
  );
};

export default SaleBanner;
