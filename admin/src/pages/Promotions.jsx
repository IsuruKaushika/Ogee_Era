import React from "react";
import ImageField from "../components/ImageField";
import { useSiteSettings } from "../lib/useSiteSettings";

const LINKS = ["/collection", "/collection?offers=1", "/category/dresses", "/category/tops", "/category/sarongs", "/category/sarees", "/category/men"];

const Input = ({ label, value, onChange, hint, list, max = 200, textarea = false }) => (
  <label className="block">
    <span className="block mb-1 text-sm">{label}</span>
    {textarea ? (
      <textarea className="w-full border px-3 py-2 bg-white" rows={2} maxLength={max} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    ) : (
      <input className="w-full border px-3 py-2 bg-white" list={list} maxLength={max} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    )}
    {hint && <span className="block mt-1 text-xs text-gray-400">{hint}</span>}
  </label>
);

const Card = ({ title, children, right }) => (
  <section className="border bg-white p-5 mb-6 rounded">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-medium text-gray-800">{title}</h2>
      {right}
    </div>
    {children}
  </section>
);

const SECTIONS = [
  ["categories", "Category circles"],
  ["newArrivals", "New arrivals"],
  ["promos", "Promotion banners"],
  ["bestSellers", "Best sellers"],
  ["specialOffers", "Special offers"],
  ["policyStrip", "Delivery / returns strip"],
  ["reviews", "Customer reviews"],
  ["instagram", "Instagram photos"],
  ["newsletter", "Newsletter sign-up"],
];

const Promotions = ({ token }) => {
  const { settings: s, patch, save, saving } = useSiteSettings(token);
  if (!s) return <p>Loading...</p>;

  const set = (key, field) => (v) => patch(key, { ...s[key], [field]: v });
  const slides = s.hero.slides;
  const setQuotes = (next) => patch("hero", { ...s.hero, quotes: next });
  const setSlides = (next) => patch("hero", { ...s.hero, slides: next });
  const editSlide = (i, field, v) => setSlides(slides.map((x, n) => (n === i ? { ...x, [field]: v } : x)));
  const move = (arr, i, d) => {
    const j = i + d;
    if (j < 0 || j >= arr.length) return arr;
    const c = arr.slice();
    [c[i], c[j]] = [c[j], c[i]];
    return c;
  };
  const editPromo = (i, field, v) => patch("promos", s.promos.map((x, n) => (n === i ? { ...x, [field]: v } : x)));

  return (
    <div className="max-w-3xl pb-24">
      <datalist id="links">{LINKS.map((l) => <option key={l} value={l} />)}</datalist>
      <h1 className="text-2xl font-medium text-gray-800 mb-1">Promotions &amp; homepage</h1>
      <p className="text-sm text-gray-500 mb-6">Everything here appears on the website exactly as you set it. Save when you are done.</p>

      <Card title="Announcement bar (top of every page)">
        <label className="flex items-center gap-2 mb-3 text-sm">
          <input type="checkbox" checked={s.announcement.enabled} onChange={(e) => set("announcement", "enabled")(e.target.checked)} /> Show the bar
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Main message" value={s.announcement.text} onChange={set("announcement", "text")} hint="Leave empty to show the free-delivery message automatically." max={160} />
          <Input label="Second message (desktop)" value={s.announcement.secondaryText} onChange={set("announcement", "secondaryText")} hint="Leave empty to show the returns message automatically." max={160} />
        </div>
      </Card>

      <Card title="Hero banner (big banner at the top of the homepage)">
        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <Input label="Headline" value={s.hero.headline} onChange={set("hero", "headline")} max={120} />
          <Input label="Text under the headline" value={s.hero.subtext} onChange={set("hero", "subtext")} max={300} />
          <Input label="Main button text" value={s.hero.primaryLabel} onChange={set("hero", "primaryLabel")} max={40} />
          <Input label="Main button link" value={s.hero.primaryLink} onChange={set("hero", "primaryLink")} list="links" />
          <Input label="Second link text" value={s.hero.secondaryLabel} onChange={set("hero", "secondaryLabel")} max={40} />
          <Input label="Second link" value={s.hero.secondaryLink} onChange={set("hero", "secondaryLink")} list="links" />
        </div>
        <p className="text-sm font-medium mb-1">Quotes for best-seller slides</p>
        <p className="text-xs text-gray-400 mb-3">
          With no uploaded slides below, the banner loops through your popular products (items marked as Best Seller) and shows these quotes in turn,
          one per picture. Add as many as you like (up to 10).
        </p>
        {s.hero.quotes.map((q, i) => (
          <div key={i} className="border p-3 mb-2 rounded bg-gray-50 grid gap-2">
            <Input label={`Quote ${i + 1}`} value={q.title} onChange={(v) => setQuotes(s.hero.quotes.map((x, n) => (n === i ? { ...x, title: v } : x)))} max={120} />
            <Input label="Text under the quote" value={q.subtitle} onChange={(v) => setQuotes(s.hero.quotes.map((x, n) => (n === i ? { ...x, subtitle: v } : x)))} max={300} />
            <div className="flex gap-4 text-xs">
              <button type="button" className="underline" onClick={() => setQuotes(move(s.hero.quotes, i, -1))}>Move up</button>
              <button type="button" className="underline" onClick={() => setQuotes(move(s.hero.quotes, i, 1))}>Move down</button>
              <button type="button" className="underline text-red-600" onClick={() => setQuotes(s.hero.quotes.filter((_, n) => n !== i))}>Delete</button>
            </div>
          </div>
        ))}
        {s.hero.quotes.length < 10 && (
          <button type="button" className="px-4 py-2 border bg-white mb-2" onClick={() => setQuotes([...s.hero.quotes, { title: "", subtitle: "" }])}>+ Add quote</button>
        )}
        <div className="max-w-xs mb-6">
          <Input label="Button text on best-seller slides" value={s.hero.productCtaLabel} onChange={set("hero", "productCtaLabel")} max={40} hint="The button opens that product's page." />
        </div>

        <p className="text-sm font-medium mb-1">Slides</p>
        <p className="text-xs text-gray-400 mb-3">Upload your own pictures to control exactly what shows. With no slides, the site rotates photos of your best-selling products using the headline above.</p>
        {slides.map((sl, i) => (
          <div key={i} className="border p-4 mb-3 rounded bg-gray-50">
            <div className="flex flex-wrap gap-4">
              <ImageField token={token} label={`Slide ${i + 1} picture`} value={sl.image} onChange={(v) => editSlide(i, "image", v)} className="w-32 h-40" hint="Portrait photos work best (about 3:4)." />
              <div className="flex-1 min-w-[220px] grid gap-3">
                <Input label="Headline (optional)" value={sl.title} onChange={(v) => editSlide(i, "title", v)} max={120} />
                <Input label="Text (optional)" value={sl.subtitle} onChange={(v) => editSlide(i, "subtitle", v)} max={300} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Button text" value={sl.ctaLabel} onChange={(v) => editSlide(i, "ctaLabel", v)} max={40} />
                  <Input label="Button link" value={sl.ctaLink} onChange={(v) => editSlide(i, "ctaLink", v)} list="links" />
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-4 text-xs">
              <button type="button" className="underline" onClick={() => setSlides(move(slides, i, -1))}>Move up</button>
              <button type="button" className="underline" onClick={() => setSlides(move(slides, i, 1))}>Move down</button>
              <button type="button" className="underline text-red-600" onClick={() => setSlides(slides.filter((_, n) => n !== i))}>Delete slide</button>
            </div>
          </div>
        ))}
        {slides.length < 8 && (
          <button type="button" className="px-4 py-2 border bg-white" onClick={() => setSlides([...slides, { image: "", title: "", subtitle: "", ctaLabel: "", ctaLink: "" }])}>
            + Add slide
          </button>
        )}
        <p className="mt-2 text-xs text-gray-400">A slide without a picture is not saved.</p>
      </Card>

      <Card title="Promotion banners (two-up banners under New Arrivals)">
        <p className="text-xs text-gray-400 mb-3">Up to 6. Shown side by side on desktop. Remove them all to hide the section.</p>
        {s.promos.map((p, i) => (
          <div key={i} className="border p-4 mb-3 rounded bg-gray-50">
            <div className="flex flex-wrap gap-4">
              <ImageField token={token} label="Picture (right half)" value={p.image} onChange={(v) => editPromo(i, "image", v)} className="w-32 h-40" hint="Optional. Without one, the banner is a solid colour." />
              <div className="flex-1 min-w-[220px] grid gap-3">
                <Input label="Title" value={p.title} onChange={(v) => editPromo(i, "title", v)} max={80} />
                <Input label="Subtitle" value={p.subtitle} onChange={(v) => editPromo(i, "subtitle", v)} max={160} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Badge (e.g. UP TO 30% OFF)" value={p.badge} onChange={(v) => editPromo(i, "badge", v)} max={40} />
                  <Input label="Button text" value={p.ctaLabel} onChange={(v) => editPromo(i, "ctaLabel", v)} max={40} />
                </div>
                <Input label="Click goes to" value={p.link} onChange={(v) => editPromo(i, "link", v)} list="links" />
                <div className="flex flex-wrap items-center gap-5 text-sm">
                  <label className="flex items-center gap-2">Background <input type="color" value={p.bgColor} onChange={(e) => editPromo(i, "bgColor", e.target.value)} /></label>
                  <label className="flex items-center gap-2">Text <input type="color" value={p.textColor} onChange={(e) => editPromo(i, "textColor", e.target.value)} /></label>
                  <label className="flex items-center gap-2" title="Use for a finished poster/flyer: shows the whole picture with no text added"><input type="checkbox" checked={p.poster === true} onChange={(e) => editPromo(i, "poster", e.target.checked)} /> Show picture as a full poster</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={p.enabled !== false} onChange={(e) => editPromo(i, "enabled", e.target.checked)} /> Visible</label>
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-4 text-xs">
              <button type="button" className="underline" onClick={() => patch("promos", move(s.promos, i, -1))}>Move up</button>
              <button type="button" className="underline" onClick={() => patch("promos", move(s.promos, i, 1))}>Move down</button>
              <button type="button" className="underline text-red-600" onClick={() => patch("promos", s.promos.filter((_, n) => n !== i))}>Delete banner</button>
            </div>
          </div>
        ))}
        {s.promos.length < 6 && (
          <button type="button" className="px-4 py-2 border bg-white" onClick={() => patch("promos", [...s.promos, { image: "", title: "", subtitle: "", badge: "", ctaLabel: "Shop now", link: "/collection", bgColor: "#3a2f28", textColor: "#ffffff", enabled: true }])}>
            + Add banner
          </button>
        )}
      </Card>

      <Card title="Homepage sections">
        <p className="text-xs text-gray-400 mb-3">Tick the sections you want on the homepage.</p>
        <div className="grid sm:grid-cols-2 gap-2 mb-5">
          {SECTIONS.map(([k, label]) => (
            <label key={k} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={s.sections[k] !== false} onChange={(e) => set("sections", k)(e.target.checked)} /> {label}
            </label>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Newsletter title" value={s.newsletter.title} onChange={set("newsletter", "title")} max={80} />
          <Input label="Newsletter text" value={s.newsletter.text} onChange={set("newsletter", "text")} max={200} />
        </div>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-6 py-3 flex justify-end">
        <button disabled={saving} onClick={() => save(["announcement", "hero", "promos", "sections", "newsletter"])} className="px-6 py-2 bg-black text-white disabled:opacity-60">
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
};

export default Promotions;
