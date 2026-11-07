import { useContext, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import { useSettings } from "../context/SettingsContext";

const sq = (u) => u?.replace("/upload/", "/upload/f_auto,q_auto,w_360,h_360,c_fill,g_auto/");

const InstagramStrip = () => {
  const { products } = useContext(ShopContext);
  const { social } = useSettings();
  const pics = useMemo(() => products.filter((p) => p.image?.length).slice(0, 6).map((p) => p.image[p.image.length > 1 ? 1 : 0]), [products]);
  if (!pics.length || !social.instagram) return null;

  return (
    <section className="py-10 md:py-14 border-t border-stone/60">
      <h2 className="font-display text-3xl sm:text-4xl text-center mb-8">
        Follow Us{" "}
        <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="underline decoration-stone underline-offset-4">
          @{social.instagramHandle || "instagram"}
        </a>
      </h2>
      <div className="grid grid-cols-3 md:grid-cols-6">
        {pics.map((src, i) => (
          <a key={i} href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="block overflow-hidden aspect-square">
            <img src={sq(src)} alt="" className="w-full h-full object-cover hover:scale-105 transition duration-500" loading="lazy" width="360" height="360" />
          </a>
        ))}
      </div>
    </section>
  );
};

export default InstagramStrip;
