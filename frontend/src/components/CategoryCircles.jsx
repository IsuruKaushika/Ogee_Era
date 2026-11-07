import { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const CATS = [
  { label: "Dresses", to: "/category/dresses", match: (p) => p.subCategory === "Dress" },
  { label: "Tops", to: "/category/tops", match: (p) => ["Tops", "TopWear"].includes(p.subCategory) },
  { label: "Lungi & Sarong", to: "/category/sarongs", match: (p) => p.subCategory === "Lungi&Sarong" },
  { label: "Sarees", to: "/category/sarees", match: (p) => p.subCategory === "Saree" },
  { label: "Men", to: "/category/men", match: (p) => p.category === "Men" },
  { label: "Sale", to: "/collection?offers=1", match: (p) => Number(p.discount) > 0 },
];

const thumb = (url) => url?.replace("/upload/", "/upload/f_auto,q_auto,w_240,h_240,c_fill,g_auto/");

const Item = ({ c, hidden }) => (
  <li className="shrink-0 w-[132px] md:w-[168px] text-center" aria-hidden={hidden || undefined}>
    <Link to={c.to} tabIndex={hidden ? -1 : undefined} className="group block">
      <span className="block w-[84px] h-[84px] md:w-[104px] md:h-[104px] rounded-full overflow-hidden bg-sand mx-auto ring-1 ring-stone/60 group-hover:ring-ink transition">
        <img src={thumb(c.product.image[0])} alt={hidden ? "" : c.label} className="w-full h-full object-cover" loading="lazy" width="104" height="104" />
      </span>
      <span className="block mt-3 text-[13px]">{c.label}</span>
    </Link>
  </li>
);

// Round category shortcuts that glide past in an endless horizontal loop (pauses on hover or focus).
// The picture for each category is a real product from that category.
const CategoryCircles = () => {
  const { products } = useContext(ShopContext);
  const cats = useMemo(
    () =>
      CATS.map((c) => ({
        ...c,
        product: products.find((p) => c.match(p) && p.image?.[0] && p.stockStatus !== "Out of Stock") || products.find((p) => c.match(p)),
      })).filter((c) => c.product),
    [products],
  );
  if (!cats.length) return null;

  // One "half" repeats the list enough times to be wider than any screen; the track holds two halves
  // and slides by exactly one half, so the loop has no visible jump.
  const half = Array.from({ length: Math.max(2, Math.ceil(14 / cats.length)) }, () => cats).flat();

  return (
    <section className="py-10 md:py-14 overflow-hidden" aria-label="Shop by category">
      <div className="category-marquee">
        <ul className="category-track" style={{ "--loop-seconds": `${Math.max(24, half.length * 3.2)}s` }}>
          {half.map((c, i) => (
            <Item key={`a${i}`} c={c} />
          ))}
          {half.map((c, i) => (
            <Item key={`b${i}`} c={c} hidden />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default CategoryCircles;
