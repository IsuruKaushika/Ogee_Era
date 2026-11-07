import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";

// Approve or delete customer reviews. Only approved reviews are public.
const Reviews = ({ token }) => {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("pending");

  const load = async () => {
    try {
      const { data } = await axios.post(backendUrl + "/api/review/admin/list", {}, { headers: { token } });
      if (data.success) setReviews(data.reviews);
      else toast.error(data.message || "Failed to load reviews");
    } catch (e) {
      toast.error(e.message);
    }
  };
  useEffect(() => { load(); }, []);

  const act = async (path, body) => {
    const { data } = await axios.post(backendUrl + path, body, { headers: { token } });
    if (data.success) load();
    else toast.error(data.message || "Action failed");
  };

  const shown = reviews.filter((r) => (filter === "pending" ? !r.approved : filter === "approved" ? r.approved : true));

  return (
    <div>
      <p className="mb-4 text-xl font-medium">Customer Reviews</p>
      <div className="flex gap-2 mb-4">
        {["pending", "approved", "all"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 border rounded ${filter === f ? "bg-black text-white" : "bg-white"}`}>
            {f} {f === "pending" ? `(${reviews.filter((r) => !r.approved).length})` : ""}
          </button>
        ))}
      </div>
      {shown.length === 0 && <p>No reviews here.</p>}
      <div className="flex flex-col gap-3">
        {shown.map((r) => (
          <div key={r._id} className="border bg-white p-4 rounded">
            <p className="font-medium">{r.name} &middot; {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)} {r.verifiedBuyer && <span className="text-xs text-green-700">verified buyer</span>}</p>
            <p className="mt-1">{r.comment}</p>
            <p className="text-xs text-gray-400 mt-1">Product {r.productId} &middot; {new Date(r.createdAt).toLocaleString()}</p>
            <div className="mt-3 flex gap-2">
              {!r.approved ? (
                <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => act("/api/review/admin/approve", { id: r._id, approved: true })}>Approve</button>
              ) : (
                <button className="px-3 py-1 border rounded" onClick={() => act("/api/review/admin/approve", { id: r._id, approved: false })}>Hide</button>
              )}
              <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => window.confirm("Delete this review?") && act("/api/review/admin/delete", { id: r._id })}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
