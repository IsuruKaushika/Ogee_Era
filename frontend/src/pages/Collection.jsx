import { useContext, useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "../components/ProductItem";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import RevealOnScroll from "../components/RevealOnScroll";
import Seo, { SITE_URL } from "../components/Seo";
import { CATEGORIES } from "../data/categories";
import { soldOutLast, isSoldOut } from "../utils/format";

const TYPES = [
  ["Dress", "Dresses"],
  ["Tops", "Tops"],
  ["Saree", "Sarees"],
  ["Lungi&Sarong", "Lungi & Sarong"],
];

const Collection = () => {
  const { products, search, isProductsLoading } = useContext(ShopContext);
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const cat = slug ? CATEGORIES[slug] : null;

  const offersOnly = params.get("offers") === "1";
  const [showFilter, setShowFilter] = useState(false);
  const [types, setTypes] = useState([]);
  const [men, setMen] = useState(false);
  const [women, setWomen] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("new");

  const list = useMemo(() => {
    let out = products.slice();
    if (cat) out = out.filter(cat.match);
    if (search) out = out.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (offersOnly) out = out.filter((p) => Number(p.discount) > 0);
    if (types.length) out = out.filter((p) => types.includes(p.subCategory === "TopWear" ? "Tops" : p.subCategory));
    if (men !== women) out = out.filter((p) => p.category === (men ? "Men" : "Women"));
    if (inStockOnly) out = out.filter((p) => !isSoldOut(p));
    const price = (p) => p.price * (1 - (p.discount || 0) / 100);
    if (sort === "low-high") out.sort((a, b) => price(a) - price(b));
    else if (sort === "high-low") out.sort((a, b) => price(b) - price(a));
    return soldOutLast(out); // available items first
  }, [products, cat, search, offersOnly, types, men, women, inStockOnly, sort]);

  const toggleType = (v) => setTypes((t) => (t.includes(v) ? t.filter((x) => x !== v) : [...t, v]));
  const offerCount = products.filter((p) => Number(p.discount) > 0).length;
  const heading = cat ? cat.label : offersOnly ? "Sale" : "All Collections";

  const Check = ({ checked, onChange, children }) => (
    <label className="flex items-center gap-2 text-sm text-ink/80 cursor-pointer">
      <input type="checkbox" className="accent-black" checked={checked} onChange={onChange} />
      {children}
    </label>
  );

  if (slug && !cat) {
    return (
      <div className="py-24 text-center">
        <Seo title="Page not found" path={`/category/${slug}`} noindex />
        <h1 className="text-4xl">We couldn&apos;t find that category</h1>
        <Link to="/collection" className="btn-dark mt-6">Browse everything</Link>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12">
      {cat ? (
        <Seo
          title={cat.title}
          description={cat.description}
          path={`/category/${slug}`}
          jsonLd={{
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: cat.label, item: `${SITE_URL}/category/${slug}` },
            ],
          }}
        />
      ) : null}

      <nav className="text-xs text-taupe mb-4" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-ink">Home</Link> / {cat ? <><Link to="/collection" className="hover:text-ink">Shop</Link> / {cat.label}</> : "Shop"}
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl">{cat ? cat.title : heading}</h1>
        {cat && <p className="mt-3 max-w-2xl text-[15px] text-ink/75 leading-relaxed">{cat.intro}</p>}
      </div>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <aside className="md:w-52 lg:w-60 shrink-0">
          <button onClick={() => setShowFilter(!showFilter)} className="md:hidden w-full flex items-center justify-between border border-stone py-3 px-4 text-sm">
            Filters <span>{showFilter ? "−" : "+"}</span>
          </button>
          <div className={`${showFilter ? "block" : "hidden"} md:block space-y-7 mt-4 md:mt-0`}>
            {!cat && (
              <div>
                <p className="text-xs tracking-[0.14em] uppercase mb-3">Type</p>
                <div className="space-y-2">
                  {TYPES.map(([v, label]) => (
                    <Check key={v} checked={types.includes(v)} onChange={() => toggleType(v)}>{label}</Check>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-xs tracking-[0.14em] uppercase mb-3">For</p>
              <div className="space-y-2">
                <Check checked={women} onChange={() => setWomen(!women)}>Women</Check>
                <Check checked={men} onChange={() => setMen(!men)}>Men</Check>
              </div>
            </div>
            <div>
              <p className="text-xs tracking-[0.14em] uppercase mb-3">Availability</p>
              <Check checked={inStockOnly} onChange={() => setInStockOnly(!inStockOnly)}>In stock only</Check>
            </div>
            <div>
              <p className="text-xs tracking-[0.14em] uppercase mb-3">Offers</p>
              <Check
                checked={offersOnly}
                onChange={() => {
                  const next = new URLSearchParams(params);
                  offersOnly ? next.delete("offers") : next.set("offers", "1");
                  setParams(next, { replace: true });
                }}
              >
                On sale ({offerCount})
              </Check>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 text-sm">
            <p className="text-ink/60">{isProductsLoading ? "Loading..." : `${list.length} ${list.length === 1 ? "item" : "items"}`}</p>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-stone bg-white px-3 py-2 text-sm" aria-label="Sort products">
              <option value="new">Newest first</option>
              <option value="low-high">Price: low to high</option>
              <option value="high-low">Price: high to low</option>
            </select>
          </div>

          {isProductsLoading ? (
            <ProductGridSkeleton count={8} gridClassName="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 gap-y-8" />
          ) : list.length === 0 ? (
            <div className="py-20 text-center text-ink/70">
              <p className="font-display text-3xl">Nothing matches yet</p>
              <p className="mt-2 text-sm">Try removing a filter, or message us on WhatsApp and we&apos;ll help you find it.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 gap-y-8">
              {list.map((p) => (
                <RevealOnScroll key={p._id} delay={20} distance={20} duration={600} threshold={0.05}>
                  <ProductItem id={p._id} name={p.name} image={p.image} price={p.price} stockStatus={p.stockStatus} discount={p.discount} />
                </RevealOnScroll>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collection;
