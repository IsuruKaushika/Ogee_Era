import { useContext, useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiHeart, FiTruck, FiRefreshCw } from "react-icons/fi";
import { ShopContext } from "../context/ShopContext";
import RelatedProducts from "../components/RelatedProducts";
import ProductDetailsSkeleton from "../components/ProductDetailsSkeleton";
import ProductReviews from "../components/ProductReviews";
import Seo, { SITE_URL } from "../components/Seo";
import { useSettings } from "../context/SettingsContext";
import { formatPrice, finalPrice } from "../utils/format";
import { trackViewItem } from "../utils/analytics";

const big = (u) => u?.replace("/upload/", "/upload/f_auto,q_auto,w_1000,c_limit/");
const thumb = (u) => u?.replace("/upload/", "/upload/f_auto,q_auto,w_200,c_limit/");

const Product = () => {
  const { productId } = useParams();
  const { products, addToCart, isInWishlist, toggleWishlist, isProductsLoading, navigate } = useContext(ShopContext);
  const { commerce, business } = useSettings();
  const DELIVERY_FEE = commerce.deliveryFee;
  const FREE_DELIVERY_THRESHOLD = commerce.freeDeliveryThreshold;
  const RETURN_DAYS = commerce.returnDays;
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [sizeError, setSizeError] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [rating, setRating] = useState(null);

  const productData = useMemo(() => products.find((p) => p._id === productId) || null, [products, productId]);

  useEffect(() => {
    if (!productData) return;
    setImage(productData.image[0]);
    setSizeError(false);
    setSize(productData.sizes?.length ? "" : "default");
    trackViewItem(productData, finalPrice(productData));
  }, [productData?._id]);

  if (isProductsLoading && !productData) {
    return (
      <div className="py-10">
        <ProductDetailsSkeleton />
      </div>
    );
  }
  if (!productData) {
    return (
      <div className="py-24 text-center">
        <Seo title="Product not found" path={`/product/${productId}`} noindex />
        <h1 className="text-4xl">This product is no longer available</h1>
        <Link to="/collection" className="btn-dark mt-6">Continue shopping</Link>
      </div>
    );
  }

  const p = productData;
  const hasSizes = p.sizes?.length > 0;
  const soldOut = p.stockStatus === "Out of Stock";
  const now = finalPrice(p);
  const url = `${SITE_URL}/product/${p._id}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.image,
    sku: p._id,
    category: `${p.category} / ${p.subCategory}`,
    brand: { "@type": "Brand", name: business.name },
    ...(rating?.count > 0 ? { aggregateRating: { "@type": "AggregateRating", ratingValue: rating.average, reviewCount: rating.count } } : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "LKR",
      price: Number(now).toFixed(2),
      availability: soldOut ? "https://schema.org/OutOfStock" : p.stockStatus === "Limited Stock" ? "https://schema.org/LimitedAvailability" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: DELIVERY_FEE, currency: "LKR" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "LK" },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "LK",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: RETURN_DAYS,
      },
    },
  };

  const handleAdd = () => {
    if (hasSizes && !size) {
      setSizeError(true);
      return;
    }
    addToCart(p._id, hasSizes ? size : "default");
  };

  const handleBuyNow = () => {
    if (hasSizes && !size) {
      setSizeError(true);
      return;
    }
    addToCart(p._id, hasSizes ? size : "default");
    navigate("/cart");
  };

  const waNotify = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(`Hi ${business.name}, please let me know when "${p.name}" is back in stock. ${url}`)}`;
  const waAsk = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(`Hi ${business.name}, I have a question about "${p.name}". ${url}`)}`;

  return (
    <div className="py-8 md:py-12">
      <Seo title={p.name} description={String(p.description || "").replace(/\s+/g, " ").slice(0, 155) || `Buy ${p.name} online in Sri Lanka at OgeeEra.`} path={`/product/${p._id}`} image={p.image?.[0]} type="product" jsonLd={schema} />

      <nav className="text-xs text-taupe mb-5" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-ink">Home</Link> / <Link to="/collection" className="hover:text-ink">Shop</Link> / {p.name}
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
        {/* Gallery */}
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <div className="flex sm:flex-col gap-2 overflow-x-auto sm:w-20 shrink-0">
            {p.image.map((src, i) => (
              <button key={i} onClick={() => setImage(src)} className={`shrink-0 w-16 sm:w-full border ${image === src ? "border-ink" : "border-transparent"}`} aria-label={`View photo ${i + 1}`}>
                <img src={thumb(src)} alt={`${p.name} view ${i + 1}`} className="w-full aspect-[3/4] object-cover" loading="lazy" />
              </button>
            ))}
          </div>
          <div className="flex-1 bg-sand">
            <img src={big(image)} alt={p.name} className="w-full h-auto" fetchPriority="high" />
          </div>
        </div>

        {/* Details */}
        <div>
          <h1 className="text-4xl leading-tight">{p.name}</h1>
          {rating?.count > 0 && (
            <a href="#reviews" className="mt-2 inline-block text-sm text-ink/70">★ {rating.average} ({rating.count} reviews)</a>
          )}

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl">{formatPrice(now)}</span>
            {p.discount > 0 && (
              <>
                <span className="text-lg line-through text-taupe">{formatPrice(p.price)}</span>
                <span className="bg-ink text-white text-xs px-2 py-1">-{p.discount}%</span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-taupe">
            {formatPrice(DELIVERY_FEE)} delivery islandwide{FREE_DELIVERY_THRESHOLD > 0 && <>, free over {formatPrice(FREE_DELIVERY_THRESHOLD)}</>}
          </p>

          <p className={`mt-4 text-sm ${p.stockStatus === "Limited Stock" ? "text-[#9a4a12]" : soldOut ? "text-red-700" : "text-green-800"}`}>
            {soldOut ? "Sold out" : p.stockStatus === "Limited Stock" ? (typeof p.stock === "number" ? `Only ${p.stock} left` : "Only a few left") : "In stock"}
          </p>

          <p className="mt-5 text-[15px] leading-relaxed text-ink/80 whitespace-pre-line">{p.description}</p>

          {hasSizes && (
            <div className="mt-7">
              <div className="flex items-center justify-between max-w-sm">
                <p className="text-sm font-medium">Size</p>
                {p.sizeChart && <button onClick={() => setShowChart(true)} className="text-xs underline">Size guide</button>}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSize(s); setSizeError(false); }}
                    className={`min-w-[48px] border px-4 py-2 text-sm ${s === size ? "border-ink bg-ink text-white" : "border-stone bg-white hover:border-ink"}`}
                    aria-pressed={s === size}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {sizeError && <p className="mt-2 text-sm text-red-700">Please select a size</p>}
            </div>
          )}
          {!hasSizes && <p className="mt-6 text-sm text-ink/70">One size / free size.</p>}

          <div className="mt-7 flex flex-wrap gap-3">
            {soldOut ? (
              business.whatsapp ? (
                <a href={waNotify} target="_blank" rel="noopener noreferrer" className="btn-dark flex-1 sm:flex-none sm:min-w-[260px]">Notify me when back</a>
              ) : (
                <button disabled className="btn-dark flex-1 sm:flex-none sm:min-w-[260px]">Sold out</button>
              )
            ) : (
              <>
                <button onClick={handleAdd} className="btn-dark flex-1 sm:flex-none sm:min-w-[200px]">Add to cart</button>
                <button onClick={handleBuyNow} className="btn-outline flex-1 sm:flex-none">Buy now</button>
              </>
            )}
            <button onClick={() => toggleWishlist(p._id)} className="border border-stone px-4 flex items-center justify-center" aria-label={isInWishlist(p._id) ? "Remove from wishlist" : "Add to wishlist"}>
              <FiHeart className={isInWishlist(p._id) ? "fill-ink" : ""} />
            </button>
          </div>

          <ul className="mt-8 space-y-3 text-sm text-ink/80 border-t border-stone/60 pt-6">
            <li className="flex gap-3"><FiTruck className="mt-0.5 shrink-0" /> Islandwide delivery. Cash on delivery or card payment.</li>
            {RETURN_DAYS > 0 && <li className="flex gap-3"><FiRefreshCw className="mt-0.5 shrink-0" /> Returns &amp; exchanges within {RETURN_DAYS} days. <Link to="/return-policy" className="underline">See policy</Link></li>}
          </ul>
          {business.whatsapp && <a href={waAsk} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block text-sm underline">Questions about fit or fabric? Ask us on WhatsApp</a>}
        </div>
      </div>

      <ProductReviews productId={p._id} onSummary={setRating} />
      <RelatedProducts category={p.category} subCategory={p.subCategory} excludeId={p._id} />

      {showChart && p.sizeChart && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowChart(false)}>
          <div className="bg-white max-w-3xl w-full p-4 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowChart(false)} className="absolute right-4 top-3 text-xl" aria-label="Close">✕</button>
            <h2 className="text-2xl mb-3">Size guide</h2>
            <img src={p.sizeChart} alt={`${p.name} size guide`} className="w-full h-auto" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;
