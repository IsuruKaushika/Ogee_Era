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

// Round category shortcuts; the picture is a real product from each category.
const CategoryCircles = () => {
  const { products } = useContext(ShopContext);
  const cats = useMemo(
    () => CATS.map((c) => ({ ...c, product: products.find((p) => c.match(p) && p.image?.[0] && p.stockStatus !== "Out of Stock") || products.find((p) => c.match(p)) }))
      .filter((c) => c.product),
    [products],
  );
  if (!cats.length) return null;

  return (
    <section className="container-x py-10 md:py-14">
      <ul className="flex md:justify-between gap-6 md:gap-4 overflow-x-auto pb-2">
        {cats.map((c) => (
          <li key={c.label} className="shrink-0 text-center">
            <Link to={c.to} className="group block">
              <span className="block w-[84px] h-[84px] md:w-[104px] md:h-[104px] rounded-full overflow-hidden bg-sand mx-auto ring-1 ring-stone/60 group-hover:ring-ink transition">
                <img src={thumb(c.product.image[0])} alt={c.label} className="w-full h-full object-cover" loading="lazy" width="104" height="104" />
              </span>
              <span className="block mt-3 text-[13px]">{c.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default CategoryCircles;
