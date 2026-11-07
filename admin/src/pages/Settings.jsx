import React from "react";
import ImageField from "../components/ImageField";
import { useSiteSettings } from "../lib/useSiteSettings";

const Input = ({ label, value, onChange, hint, type = "text", max = 200 }) => (
  <label className="block">
    <span className="block mb-1 text-sm">{label}</span>
    <input type={type} className="w-full border px-3 py-2 bg-white" maxLength={max} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    {hint && <span className="block mt-1 text-xs text-gray-400">{hint}</span>}
  </label>
);

const Card = ({ title, note, children }) => (
  <section className="border bg-white p-5 mb-6 rounded">
    <h2 className="text-lg font-medium text-gray-800">{title}</h2>
    {note && <p className="text-xs text-gray-400 mb-4">{note}</p>}
    <div className={note ? "" : "mt-4"}>{children}</div>
  </section>
);

const Settings = ({ token }) => {
  const { settings: s, patch, save, saving } = useSiteSettings(token);
  if (!s) return <p>Loading...</p>;
  const set = (key, field) => (v) => patch(key, { ...s[key], [field]: v });
  const num = (key, field) => (v) => patch(key, { ...s[key], [field]: v === "" ? "" : Number(v) });

  return (
    <div className="max-w-3xl pb-24">
      <h1 className="text-2xl font-medium text-gray-800 mb-1">Site settings</h1>
      <p className="text-sm text-gray-500 mb-6">Business details, delivery rules and logo. These appear across the website, emails and search results.</p>

      <Card title="Logo" note="Leave empty to use the standard OgeeEra logo.">
        <ImageField token={token} label="Custom logo (optional)" value={s.logoUrl} onChange={(v) => patch("logoUrl", v)} className="w-40 h-32" hint="PNG with a white or transparent background." />
      </Card>

      <Card title="Business details">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Shop name" value={s.business.name} onChange={set("business", "name")} max={60} />
          <Input label="Tagline (footer)" value={s.business.tagline} onChange={set("business", "tagline")} max={200} />
          <Input label="Email" type="email" value={s.business.email} onChange={set("business", "email")} max={120} />
          <Input label="Phone (as shown)" value={s.business.phone} onChange={set("business", "phone")} max={30} hint="e.g. +94 71 234 5678" />
          <Input label="WhatsApp number" value={s.business.whatsapp} onChange={set("business", "whatsapp")} max={20} hint="Digits only with country code, e.g. 94712345678. Empty hides the WhatsApp button." />
          <Input label="Opening hours" value={s.business.hours} onChange={set("business", "hours")} max={200} hint="e.g. Mon-Fri 9:00 AM - 6:00 PM, Sat 9:00 AM - 4:00 PM" />
        </div>
        <div className="mt-4">
          <Input label="Address" value={s.business.address} onChange={set("business", "address")} max={300} />
        </div>
      </Card>

      <Card title="Social media">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Instagram link" value={s.social.instagram} onChange={set("social", "instagram")} max={500} />
          <Input label="Instagram name" value={s.social.instagramHandle} onChange={set("social", "instagramHandle")} max={40} hint="Shown as @name on the homepage" />
          <Input label="Facebook link" value={s.social.facebook} onChange={set("social", "facebook")} max={500} />
          <Input label="TikTok link" value={s.social.tiktok} onChange={set("social", "tiktok")} max={500} />
        </div>
      </Card>

      <Card title="Delivery and returns" note="These numbers are used by the cart, product pages, FAQ, return policy and the order total.">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input type="number" label="Delivery fee (Rs)" value={s.commerce.deliveryFee} onChange={num("commerce", "deliveryFee")} />
          <Input type="number" label="Free delivery from (Rs)" value={s.commerce.freeDeliveryThreshold} onChange={num("commerce", "freeDeliveryThreshold")} hint="Order value after discounts. Use 0 for no free delivery." />
          <Input type="number" label="Return window (days)" value={s.commerce.returnDays} onChange={num("commerce", "returnDays")} />
          <Input type="number" label="Exchange window (days)" value={s.commerce.exchangeDays} onChange={num("commerce", "exchangeDays")} />
        </div>
      </Card>

      <Card title="Order sheet" note="Every order is also added to this Google Apps Script web app / sheet. Only you can see this.">
        <Input label="Google Apps Script URL" value={s.orderSheetUrl} onChange={(v) => patch("orderSheetUrl", v)} max={500} hint="Must start with https://. Leave empty to turn sheet logging off." />
      </Card>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-6 py-3 flex justify-end">
        <button disabled={saving} onClick={() => save(["logoUrl", "business", "social", "commerce", "orderSheetUrl"])} className="px-6 py-2 bg-black text-white disabled:opacity-60">
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
};

export default Settings;
