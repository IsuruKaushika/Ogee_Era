import React, { useState } from "react";
import { toast } from "react-toastify";
import { uploadImage } from "../lib/useSiteSettings";

// Click to upload a picture; shows the current one with a remove button.
const ImageField = ({ token, value, onChange, label = "Image", hint, className = "w-40 h-28" }) => {
  const [busy, setBusy] = useState(false);

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) return toast.error("Image is too large (max 8 MB)");
    setBusy(true);
    try {
      onChange(await uploadImage(token, file));
    } catch (err) {
      toast.error(err.message);
    }
    setBusy(false);
  };

  return (
    <div>
      <p className="mb-1 text-sm">{label}</p>
      <div className="flex items-start gap-3">
        <label className={`${className} border border-dashed border-gray-400 bg-white flex items-center justify-center overflow-hidden cursor-pointer text-xs text-gray-500 text-center`}>
          {value ? <img src={value} alt="" className="w-full h-full object-cover" /> : busy ? "Uploading..." : "Click to upload"}
          <input type="file" accept="image/*" className="hidden" onChange={pick} disabled={busy} />
        </label>
        {value && (
          <button type="button" onClick={() => onChange("")} className="text-xs text-red-600 underline">Remove</button>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-gray-400 max-w-xs">{hint}</p>}
    </div>
  );
};

export default ImageField;
