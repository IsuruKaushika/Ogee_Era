// One-time migration: copies the business details that used to be hard-coded in the website into the
// database so they show up (and can be edited) in admin > Settings.
//
//   cd backend && npm run seed:settings
//
// Safe to re-run: it never overwrites settings that already exist, it only fills in what is missing.
import "dotenv/config";
import mongoose from "mongoose";
import settingsModel from "../models/settingsModel.js";

const STARTING_VALUES = {
  business: {
    name: "OgeeEra",
    email: "ogeeeraa@gmail.com",
    phone: "+94 71 220 5395",
    whatsapp: "94712205395",
    address: "",
    hours: "Mon-Fri 9:00 AM - 6:00 PM, Sat 9:00 AM - 4:00 PM, closed Sunday",
  },
  social: {
    facebook: "https://www.facebook.com/share/1BZtCgfBgd/?mibextid=wwXIfr",
    instagram: "https://www.instagram.com/ogee_era?igsh=MTI0aG94cG5rMGQxMA==",
    instagramHandle: "ogee_era",
    tiktok: "https://www.tiktok.com/@0gee_era?_t=ZS-8vqiO4zOGkK&_r=1",
  },
  // Orders keep being copied to the existing Google Sheet. Change it any time in admin > Settings.
  orderSheetUrl:
    "https://script.google.com/macros/s/AKfycby7DDOdCEGRVUtOPGaULYkqRmFIM-3GJaQYA2Esufme4KOPn0aCTlmFwX18iu5T_vGtIQ/exec",
};

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set (backend/.env).");
  process.exit(1);
}

await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`);
const existing = (await settingsModel.findOne({ key: "main" }).lean())?.data || {};
const next = { ...existing };
let added = [];
for (const [key, value] of Object.entries(STARTING_VALUES)) {
  if (existing[key] === undefined) {
    next[key] = value;
    added.push(key);
  }
}
await settingsModel.updateOne({ key: "main" }, { $set: { data: next } }, { upsert: true });
console.log(added.length ? `Seeded: ${added.join(", ")}` : "Nothing to seed, settings already exist.");
await mongoose.disconnect();
