import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import { Stars } from "./CustomerReviews";

// Real, moderated reviews. New reviews are saved as pending and shown after admin approval.
const ProductReviews = ({ productId, onSummary }) => {
  const { backendUrl, token } = useContext(ShopContext);
  const [data, setData] = useState({ reviews: [], count: 0, average: 0 });
  const [form, setForm] = useState({ name: "", rating: 5, comment: "" });
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    axios
      .get(`${backendUrl}/api/review/product/${productId}`)
      .then((r) => {
        if (!live || !r.data.success) return;
        setData(r.data);
        onSummary?.({ count: r.data.count, average: r.data.average });
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [backendUrl, productId]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data: res } = await axios.post(
        `${backendUrl}/api/review/add`,
        { productId, ...form },
        { headers: token ? { token } : {} },
      );
      if (res.success) {
        toast.success(res.message);
        setForm({ name: "", rating: 5, comment: "" });
        setOpen(false);
      } else toast.error(res.message);
    } catch {
      toast.error("Could not send your review. Please try again.");
    }
    setBusy(false);
  };

  return (
    <section className="mt-16 border-t border-stone/60 pt-10" id="reviews">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl">Customer Reviews</h2>
          {data.count > 0 ? (
            <p className="mt-1 text-sm text-ink/70"><Stars value={data.average} /> {data.average} out of 5 &middot; {data.count} {data.count === 1 ? "review" : "reviews"}</p>
          ) : (
            <p className="mt-1 text-sm text-ink/70">No reviews yet. Bought this piece? Be the first to share how it fits.</p>
          )}
        </div>
        <button className="btn-outline" onClick={() => setOpen(!open)}>{open ? "Cancel" : "Write a review"}</button>
      </div>

      {open && (
        <form onSubmit={submit} className="mt-6 grid gap-3 max-w-xl">
          <input className="field" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={60} />
          <label className="text-sm flex items-center gap-3">
            Rating
            <select className="field !w-auto" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>)}
            </select>
          </label>
          <textarea className="field min-h-[100px]" placeholder="How was the fit, fabric and quality?" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} required minLength={10} maxLength={800} />
          <button className="btn-dark justify-self-start" disabled={busy}>{busy ? "Sending..." : "Submit review"}</button>
          <p className="text-xs text-taupe">Reviews are checked before they appear.</p>
        </form>
      )}

      <ul className="mt-8 divide-y divide-stone/60">
        {data.reviews.map((r) => (
          <li key={r._id} className="py-5">
            <Stars value={r.rating} />
            <p className="mt-2 text-[15px] leading-relaxed">{r.comment}</p>
            <p className="mt-2 text-xs text-taupe">
              {r.name}{r.verifiedBuyer && " · Verified buyer"} · {new Date(r.createdAt).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ProductReviews;
