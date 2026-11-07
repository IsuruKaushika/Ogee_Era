import fs from "node:fs";
import { v2 as cloudinary } from "cloudinary";
import settingsModel from "../models/settingsModel.js";
import { getSettings, invalidateSettings, publicSettings } from "../config/settings.js";

// ---------- validation helpers: everything the admin sends is cleaned before it is saved ----------
const str = (v, max = 300) => String(v ?? "").trim().slice(0, max);
const num = (v, min, max, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
};
const bool = (v) => v === true || v === "true";
// Internal path or http(s) URL only: blocks javascript: links
const link = (v) => {
  const s = str(v, 500);
  return s === "" || s.startsWith("/") || /^https?:\/\//i.test(s) ? s : "";
};
const imageUrl = (v) => {
  const s = str(v, 800);
  return s === "" || /^https?:\/\//i.test(s) ? s : "";
};
const color = (v, fallback) => (/^#[0-9a-fA-F]{6}$/.test(String(v)) ? String(v) : fallback);

const SECTION_KEYS = ["categories", "newArrivals", "promos", "bestSellers", "specialOffers", "policyStrip", "reviews", "instagram", "newsletter"];

const cleaners = {
  business: (v = {}) => ({
    name: str(v.name, 60),
    tagline: str(v.tagline, 200),
    email: str(v.email, 120),
    phone: str(v.phone, 30),
    whatsapp: str(v.whatsapp, 20).replace(/\D/g, ""),
    address: str(v.address, 300),
    hours: str(v.hours, 200),
  }),
  social: (v = {}) => ({
    facebook: link(v.facebook),
    instagram: link(v.instagram),
    instagramHandle: str(v.instagramHandle, 40).replace(/^@/, ""),
    tiktok: link(v.tiktok),
  }),
  logoUrl: (v) => imageUrl(v),
  commerce: (v = {}) => ({
    deliveryFee: num(v.deliveryFee, 0, 100000, 400),
    freeDeliveryThreshold: num(v.freeDeliveryThreshold, 0, 10000000, 0),
    returnDays: num(v.returnDays, 0, 365, 7),
    exchangeDays: num(v.exchangeDays, 0, 365, 7),
  }),
  announcement: (v = {}) => ({ enabled: bool(v.enabled), text: str(v.text, 160), secondaryText: str(v.secondaryText, 160) }),
  hero: (v = {}) => ({
    headline: str(v.headline, 120),
    subtext: str(v.subtext, 300),
    primaryLabel: str(v.primaryLabel, 40),
    primaryLink: link(v.primaryLink),
    secondaryLabel: str(v.secondaryLabel, 40),
    secondaryLink: link(v.secondaryLink),
    productCtaLabel: str(v.productCtaLabel, 40),
    quotes: (Array.isArray(v.quotes) ? v.quotes : [])
      .slice(0, 10)
      .map((q) => ({ title: str(q.title, 120), subtitle: str(q.subtitle, 300) }))
      .filter((q) => q.title),
    slides: (Array.isArray(v.slides) ? v.slides : [])
      .slice(0, 8)
      .map((s) => ({
        image: imageUrl(s.image),
        title: str(s.title, 120),
        subtitle: str(s.subtitle, 300),
        ctaLabel: str(s.ctaLabel, 40),
        ctaLink: link(s.ctaLink),
      }))
      .filter((s) => s.image),
  }),
  promos: (v = []) =>
    (Array.isArray(v) ? v : [])
      .slice(0, 6)
      .map((p) => ({
        image: imageUrl(p.image),
        title: str(p.title, 80),
        subtitle: str(p.subtitle, 160),
        badge: str(p.badge, 40),
        ctaLabel: str(p.ctaLabel, 40),
        link: link(p.link),
        bgColor: color(p.bgColor, "#3a2f28"),
        textColor: color(p.textColor, "#ffffff"),
        enabled: p.enabled !== false && p.enabled !== "false",
      }))
      .filter((p) => p.title || p.image),
  sections: (v = {}) => Object.fromEntries(SECTION_KEYS.map((k) => [k, v[k] !== false && v[k] !== "false"])),
  newsletter: (v = {}) => ({ title: str(v.title, 80), text: str(v.text, 200) }),
  orderSheetUrl: (v) => {
    const s = str(v, 500);
    return s === "" || /^https:\/\//i.test(s) ? s : "";
  },
};

// Public: storefront settings (never includes admin-only fields)
const getPublicSettings = async (req, res) => {
  try {
    res.set("Cache-Control", "public, max-age=30");
    res.json({ success: true, settings: publicSettings(await getSettings()) });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const adminGetSettings = async (req, res) => {
  try {
    res.json({ success: true, settings: await getSettings() });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Admin: send only the sections you changed; unknown keys are ignored
const adminUpdateSettings = async (req, res) => {
  try {
    const current = (await settingsModel.findOne({ key: "main" }).lean())?.data || {};
    const next = { ...current };
    for (const key of Object.keys(cleaners)) {
      if (req.body[key] !== undefined) next[key] = cleaners[key](req.body[key]);
    }
    await settingsModel.updateOne({ key: "main" }, { $set: { data: next } }, { upsert: true });
    invalidateSettings();
    res.json({ success: true, message: "Settings saved", settings: await getSettings() });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Admin: upload a banner or logo image to Cloudinary and return its URL
const adminUploadImage = async (req, res) => {
  try {
    if (!req.file) return res.json({ success: false, message: "No image received" });
    if (!/^image\//.test(req.file.mimetype)) {
      fs.unlink(req.file.path, () => {});
      return res.json({ success: false, message: "Only image files are allowed" });
    }
    const result = await cloudinary.uploader.upload(req.file.path, { resource_type: "image", folder: "ogeera/site" });
    fs.unlink(req.file.path, () => {});
    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export { getPublicSettings, adminGetSettings, adminUpdateSettings, adminUploadImage };
