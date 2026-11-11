import express from "express";
import visitModel from "../models/visitModel.js";
import adminAuth from "../middleware/adminAuth.js";

const analyticsRouter = express.Router();

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|monitor|curl|wget/i;
const dayKey = (offset = 0) => new Date(Date.now() + 5.5 * 3600000 - offset * 86400000).toISOString().slice(0, 10);

// Storefront calls this on every page view. "newVisitor" is true once per browser per day.
analyticsRouter.post("/hit", async (req, res) => {
  try {
    if (BOT.test(req.get("user-agent") || "")) return res.json({ success: true });
    await visitModel.updateOne(
      { day: dayKey() },
      { $inc: { views: 1, visitors: req.body?.newVisitor ? 1 : 0 } },
      { upsert: true },
    );
    res.json({ success: true });
  } catch {
    res.json({ success: false });
  }
});

analyticsRouter.post("/stats", adminAuth, async (req, res) => {
  try {
    const docs = await visitModel.find({}).lean();
    const by = Object.fromEntries(docs.map((d) => [d.day, d]));
    const sum = (days, field) => {
      let t = 0;
      for (let i = 0; i < days; i++) t += by[dayKey(i)]?.[field] || 0;
      return t;
    };
    const total = docs.reduce((a, d) => ({ views: a.views + d.views, visitors: a.visitors + d.visitors }), { views: 0, visitors: 0 });
    const byDay = [];
    for (let i = 13; i >= 0; i--) byDay.push({ day: dayKey(i), views: by[dayKey(i)]?.views || 0, visitors: by[dayKey(i)]?.visitors || 0 });
    res.json({
      success: true,
      stats: {
        today: { views: sum(1, "views"), visitors: sum(1, "visitors") },
        yesterday: { views: by[dayKey(1)]?.views || 0, visitors: by[dayKey(1)]?.visitors || 0 },
        last7: { views: sum(7, "views"), visitors: sum(7, "visitors") },
        last30: { views: sum(30, "views"), visitors: sum(30, "visitors") },
        total,
        byDay,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

export default analyticsRouter;
