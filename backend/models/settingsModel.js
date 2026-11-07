import mongoose from "mongoose";

// One document (key "main") holding everything the shop owner can customise in the admin panel.
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false },
);

export default mongoose.models.settings || mongoose.model("settings", settingsSchema);
