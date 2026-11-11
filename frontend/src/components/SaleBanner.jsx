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

  // Shades are derived from the banner colour so it still follows whatever colour is set in admin.
  const dark = `color-mix(in srgb, ${b.bgColor} 40%, #000)`;
  const light = `color-mix(in srgb, ${b.bgColor} 65%, #fff)`;
  const offers = (b.text || "").split("|").map((t) => t.trim()).filter(Boolean);
  const stroke = { WebkitTextStroke: `3px ${dark}`, paintOrder: "stroke fill" };

  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: b.bgColor, color: b.textColor }}>
      {/* poster-style swooshes */}
      <div className="absolute -left-24 -top-28 w-72 h-72 rounded-full" style={{ backgroundColor: dark }} aria-hidden="true" />
      <div className="absolute -left-10 -top-32 w-72 h-72 rounded-full opacity-90" style={{ backgroundColor: light }} aria-hidden="true" />
      <div className="absolute -left-4 -top-28 w-72 h-72 rounded-full" style={{ backgroundColor: b.bgColor }} aria-hidden="true" />
      <div className="absolute -right-24 -bottom-32 w-80 h-80 rounded-full" style={{ backgroundColor: dark }} aria-hidden="true" />
      <div className="absolute -right-12 -bottom-36 w-80 h-80 rounded-full opacity-90" style={{ backgroundColor: light }} aria-hidden="true" />
      <div className="absolute -right-6 -bottom-32 w-80 h-80 rounded-full" style={{ backgroundColor: b.bgColor }} aria-hidden="true" />

      <div className="relative container-x py-4 md:py-5 flex flex-col lg:flex-row items-center justify-center gap-3 lg:gap-8">
        {/* SALE 11.11 SALE ribbon */}
        <div className="-skew-x-12 px-6 md:px-8 py-2 shadow-lg" style={{ backgroundColor: dark }}>
          <div className="skew-x-12 flex items-center gap-2 md:gap-3 italic font-sans font-black leading-none text-white" style={{ fontSize: "clamp(1.6rem, 5vw, 2.6rem)" }}>
            {b.title && <span style={stroke}>{b.title}</span>}
            {b.badge && <span style={{ ...stroke, color: "#fff", fontSize: "1.25em" }}>{b.badge}</span>}
            {b.title && <span style={stroke}>{b.title}</span>}
          </div>
        </div>

        {/* offer pills */}
        {offers.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
            {offers.map((t, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-xl bg-white text-sm md:text-base font-bold leading-tight text-center shadow-md"
                style={{ color: dark, boxShadow: `0 3px 0 ${light}` }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col items-center gap-1">
          {b.ctaLabel && (
            <Cta
              {...ctaProps}
              className="whitespace-nowrap px-7 py-2.5 rounded-full text-xs md:text-sm font-bold tracking-[0.16em] uppercase shadow-lg hover:scale-105 transition"
              style={{ backgroundColor: dark, color: "#fff" }}
            >
              {b.ctaLabel} &rarr;
            </Cta>
          )}
          {b.endDate && <p className="text-xs font-semibold opacity-90">{untilText(b.endDate)}</p>}
        </div>
      </div>
    </div>
  );
};

export default SaleBanner;
