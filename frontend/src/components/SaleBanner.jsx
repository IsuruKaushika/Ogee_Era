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
  const dark = `color-mix(in srgb, ${b.bgColor} 55%, #000)`;
  const GOLD = "#c9a45c"; // matches the gold in the logo
  const light = `color-mix(in srgb, ${b.bgColor} 55%, #8b7b6b)`; // warm taupe
  const offers = (b.text || "").split("|").map((t) => t.trim()).filter(Boolean);
  const stroke = { WebkitTextStroke: `2px ${dark}`, paintOrder: "stroke fill" };

  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: b.bgColor, color: b.textColor }}>
      {/* poster-style swooshes */}
      <div className="absolute -left-24 -top-28 w-72 h-72 rounded-full" style={{ backgroundColor: dark }} aria-hidden="true" />
      <div className="absolute -left-10 -top-32 w-72 h-72 rounded-full opacity-90" style={{ backgroundColor: light }} aria-hidden="true" />
      <div className="absolute -left-4 -top-28 w-72 h-72 rounded-full" style={{ backgroundColor: b.bgColor }} aria-hidden="true" />
      <div className="absolute -right-24 -bottom-32 w-80 h-80 rounded-full" style={{ backgroundColor: dark }} aria-hidden="true" />
      <div className="absolute -right-12 -bottom-36 w-80 h-80 rounded-full opacity-90" style={{ backgroundColor: light }} aria-hidden="true" />
      <div className="absolute -right-6 -bottom-32 w-80 h-80 rounded-full" style={{ backgroundColor: b.bgColor }} aria-hidden="true" />

      {/* faint clothing line-art: hangers, dresses, tees */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <g id="sb-hanger"><path d="M32 12a5 5 0 1 1 5 5c-3 1-5 3-5 6v3M32 26 5 46a3 3 0 0 0 2 5h50a3 3 0 0 0 2-5Z" /></g>
          <g id="sb-dress"><path d="M23 5l4 11 5 4 5-4 4-11M27 16l-4 14L9 59h46L41 30l-4-14M23 30h18M30 36c2 3 2 7 0 10" /></g>
          <g id="sb-tee"><path d="M22 8 7 16l6 13 7-4v31h24V25l7 4 6-13-15-8c-2 6-18 6-20 0Z" /></g>
          <g id="sb-star"><path d="M8 0v16M0 8h16" /></g>
        </defs>
      </svg>
      <svg className="hidden md:block absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g fill="none" stroke={b.textColor} strokeOpacity="0.16" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <use href="#sb-dress" transform="translate(30 22) rotate(-12) scale(1.3)" />
          <use href="#sb-hanger" transform="translate(170 10) rotate(10) scale(1.1)" />
          <use href="#sb-tee" transform="translate(300 30) rotate(-8) scale(1.1)" />
          <use href="#sb-star" transform="translate(420 20)" />
          <use href="#sb-hanger" transform="translate(500 40) rotate(-14) scale(0.9)" />
          <use href="#sb-dress" transform="translate(620 8) rotate(8) scale(1.2)" />
          <use href="#sb-star" transform="translate(740 88)" />
          <use href="#sb-tee" transform="translate(790 14) rotate(12) scale(1)" />
          <use href="#sb-hanger" transform="translate(920 36) rotate(-10) scale(1.2)" />
          <use href="#sb-dress" transform="translate(1040 18) rotate(14) scale(1.25)" />
          <use href="#sb-star" transform="translate(1160 30)" />
          <use href="#sb-tee" transform="translate(1110 60) rotate(-6) scale(0.8)" />
        </g>
      </svg>

      <svg className="md:hidden absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 390 190" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g fill="none" stroke={b.textColor} strokeOpacity="0.16" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <use href="#sb-dress" transform="translate(8 14) rotate(-12) scale(1.1)" />
          <use href="#sb-tee" transform="translate(312 10) rotate(10) scale(1)" />
          <use href="#sb-hanger" transform="translate(12 118) rotate(10) scale(0.95)" />
          <use href="#sb-dress" transform="translate(318 118) rotate(12) scale(1.05)" />
          <use href="#sb-star" transform="translate(120 8)" />
          <use href="#sb-star" transform="translate(262 168)" />
          <use href="#sb-star" transform="translate(70 170)" />
        </g>
      </svg>
      <div className="relative container-x py-2.5 md:py-3 flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-7">
        {/* SALE 11.11 SALE ribbon */}
        <div className="-skew-x-12 px-5 md:px-6 py-1.5 shadow-lg" style={{ backgroundColor: dark }}>
          <div className="skew-x-12 flex items-center gap-2 md:gap-3 italic font-sans font-black leading-none" style={{ fontSize: "clamp(1.25rem, 4vw, 1.9rem)", color: b.textColor }}>
            {b.title && <span style={stroke}>{b.title}</span>}
            {b.badge && <span style={{ ...stroke, color: GOLD, fontSize: "1.25em" }}>{b.badge}</span>}
            {b.title && <span style={stroke}>{b.title}</span>}
          </div>
        </div>

        {/* offer pills */}
        {offers.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
            {offers.map((t, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold leading-tight text-center shadow-md"
                style={{ backgroundColor: "#faf7f2", color: "#231f1c", boxShadow: `0 2px 0 ${GOLD}` }}
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
              className="whitespace-nowrap px-5 py-2 rounded-full text-[11px] md:text-xs font-bold tracking-[0.16em] uppercase shadow-lg hover:scale-105 transition"
              style={{ backgroundColor: GOLD, color: "#231f1c" }}
            >
              {b.ctaLabel} &rarr;
            </Cta>
          )}
          {b.endDate && <p className="text-[11px] font-semibold opacity-90">{untilText(b.endDate)}</p>}
        </div>
      </div>
    </div>
  );
};

export default SaleBanner;
