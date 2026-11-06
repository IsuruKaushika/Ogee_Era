import express from "express";
import validator from "validator";
import subscriberModel from "../models/subscriberModel.js";
import adminAuth from "../middleware/adminAuth.js";

const newsletterRouter = express.Router();

newsletterRouter.post("/subscribe", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!validator.isEmail(email)) return res.json({ success: false, message: "Please enter a valid email address" });
    await subscriberModel.updateOne({ email }, { $setOnInsert: { email, source: req.body.source || "website" } }, { upsert: true });
    res.json({ success: true, message: "You are subscribed. Welcome to OgeeEra!" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

newsletterRouter.post("/list", adminAuth, async (req, res) => {
  try {
    res.json({ success: true, subscribers: await subscriberModel.find({}).sort({ createdAt: -1 }) });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

export default newsletterRouter;
