import settingsModel from "../models/settingsModel.js";
import { DEFAULT_SETTINGS } from "./settingsDefaults.js";

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
const merge = (base, over) => {
  if (!isObj(base) || !isObj(over)) return over === undefined ? base : over;
  const out = { ...base };
  for (const k of Object.keys(over)) out[k] = k in base ? merge(base[k], over[k]) : over[k];
  return out;
};

let cache = null;
let cachedAt = 0;
const TTL_MS = 15000;

export const invalidateSettings = () => {
  cache = null;
};

// Defaults merged with whatever the owner has saved. Cached briefly because every order reads it.
export const getSettings = async () => {
  if (cache && Date.now() - cachedAt < TTL_MS) return cache;
  const doc = await settingsModel.findOne({ key: "main" }).lean();
  cache = merge(DEFAULT_SETTINGS, doc?.data || {});
  cachedAt = Date.now();
  return cache;
};

export const deliveryFeeFor = (settings, subtotal) => {
  const { deliveryFee, freeDeliveryThreshold } = settings.commerce;
  return freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold ? 0 : deliveryFee;
};

// Everything except admin-only fields
export const publicSettings = (settings) => {
  const { orderSheetUrl, ...rest } = settings; // eslint-disable-line no-unused-vars
  return rest;
};
