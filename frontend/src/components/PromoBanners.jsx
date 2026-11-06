import { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const wide = (u) => u?.replace("/upload/", "/upload/f_auto,q_auto,w_900,c_limit/");

// Two editorial banners built from live data: current top discount and the sarong range.
const PromoBanners = () => {
  const { products } = useContext(ShopContext);

  const { offer, edit, maxOff } = useMemo(() => {
    const onSale = products.filter((p) => p.discount > 0 && p.image?.[0] && p.stockStatus !== "Out of Stock");
    const offer = [...onSale].sort((a, b) => b.discount - a.discount)[0];
    const edit = products.find((p) => p.subCategory === "Lungi&Sarong" && p.image?.[0] && p.stockStatus !== "Out of Stock");
    return { offer, edit, maxOff: offer?.discount || 0 };
  }, [products]);

  if (!offer && !edit) return null;

  return (
    <section className="container-x pb-10 md:pb-14">
      <div className="grid md:grid-cols-2 gap-4">
        {offer && (
          <Link to="/collection?offers=1" className="group relative block h-[300px] md:h-[340px] overflow-hidden bg-[#3a2f28] text-white">
            <img src={wide(offer.image[0])} alt="" className="absolute right-0 top-0 h-full w-1/2 object-cover object-top group-hover:scale-105 transition duration-700" loading="lazy" />
            <div className="absolute inset-y-0 left-0 w-1/2 p-7 md:p-9 flex flex-col justify-center bg-[#3a2f28]">
              <h3 className="font-display text-4xl leading-tight">Seasonal<br />Offers</h3>
              <p className="mt-2 text-sm text-white/75">Light. Effortless. Essential.</p>
              <p className="mt-4 text-xs tracking-[0.16em]">UP TO {maxOff}% OFF</p>
              <span className="mt-4 text-xs tracking-[0.16em] uppercase">Shop now &rarr;</span>
            </div>
          </Link>
        )}
        {edit && (
          <Link to="/category/sarongs" className="group relative block h-[300px] md:h-[340px] overflow-hidden bg-[#a58f7d] text-white">
            <img src={wide(edit.image[0])} alt="" className="absolute right-0 top-0 h-full w-1/2 object-cover object-top group-hover:scale-105 transition duration-700" loading="lazy" />
            <div className="absolute inset-y-0 left-0 w-1/2 p-7 md:p-9 flex flex-col justify-center bg-[#a58f7d]">
              <h3 className="font-display text-4xl leading-tight">The Sarong<br />Edit</h3>
              <p className="mt-2 text-sm text-white/85">Everyday comfort, island style.</p>
              <span className="mt-6 text-xs tracking-[0.16em] uppercase">Shop sarongs &rarr;</span>
            </div>
          </Link>
        )}
      </div>
    </section>
  );
};

export default PromoBanners;
