import express from "express";
import validator from "validator";
import { sendContactEmail } from "../config/email.js";
import { getSettings } from "../config/settings.js";

const contactRouter = express.Router();

// Contact form on the storefront. Delivered by email to the shop; nothing is exposed to the browser.
contactRouter.post("/send", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim().slice(0, 80);
    const email = String(req.body.email || "").trim().slice(0, 120);
    const subject = String(req.body.subject || "").trim().slice(0, 120);
    const message = String(req.body.message || "").trim().slice(0, 3000);
    if (!name || !validator.isEmail(email) || message.length < 5) {
      return res.json({ success: false, message: "Please fill in your name, a valid email and a message." });
    }
    const settings = await getSettings();
    const to = process.env.CONTACT_NOTIFY_EMAIL || process.env.ORDER_NOTIFY_EMAIL || settings.business.email || process.env.SMTP_USER;
    if (!to) return res.json({ success: false, message: "Messages are not available right now." });
    await sendContactEmail({ to, name, email, subject, message });
    res.json({ success: true });
  } catch (error) {
    console.error("Contact form failed:", error.message);
    res.json({ success: false, message: "Could not send your message. Please try again." });
  }
});

export default contactRouter;
