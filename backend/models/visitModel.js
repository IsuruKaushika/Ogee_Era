import mongoose from "mongoose";

// One small document per day (Sri Lanka time): total page views and unique visitors.
const visitSchema = new mongoose.Schema({
  day: { type: String, required: true, unique: true }, // YYYY-MM-DD
  views: { type: Number, default: 0 },
  visitors: { type: Number, default: 0 },
});

export default mongoose.models.visit || mongoose.model("visit", visitSchema);
