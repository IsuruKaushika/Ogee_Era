import validator from "validator";
import reviewModel from "../models/reviewModel.js";
import orderModel from "../models/orderModel.js";

// Public: approved reviews for one product
const listProductReviews = async (req, res) => {
  try {
    const reviews = await reviewModel
      .find({ productId: req.params.productId, approved: true })
      .sort({ createdAt: -1 })
      .select("name rating comment verifiedBuyer createdAt");
    const count = reviews.length;
    const average = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
    res.json({ success: true, reviews, count, average: Number(average.toFixed(1)) });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Public: latest approved reviews for the homepage
const listLatestReviews = async (req, res) => {
  try {
    const reviews = await reviewModel
      .find({ approved: true, rating: { $gte: 4 } })
      .sort({ createdAt: -1 })
      .limit(9)
      .select("name rating comment verifiedBuyer productId createdAt");
    res.json({ success: true, reviews });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Customer submits a review; it stays hidden until an admin approves it
const addReview = async (req, res) => {
  try {
    const { productId, name, rating, comment, userId } = req.body;
    const r = Number(rating);
    if (!productId || !validator.isMongoId(String(productId))) return res.json({ success: false, message: "Invalid product" });
    if (!name || !String(name).trim()) return res.json({ success: false, message: "Please enter your name" });
    if (!(r >= 1 && r <= 5)) return res.json({ success: false, message: "Please choose a rating from 1 to 5" });
    if (!comment || String(comment).trim().length < 10) return res.json({ success: false, message: "Please write at least 10 characters" });

    let verifiedBuyer = false;
    if (userId && userId !== "guest") {
      verifiedBuyer = !!(await orderModel.exists({ userId, "items._id": productId, status: "Delivered" }));
    }
    await reviewModel.create({
      productId,
      name: String(name).trim().slice(0, 60),
      rating: r,
      comment: String(comment).trim().slice(0, 800),
      userId: userId || "guest",
      verifiedBuyer,
    });
    res.json({ success: true, message: "Thank you! Your review will appear once it is approved." });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Admin
const adminListReviews = async (req, res) => {
  try {
    const reviews = await reviewModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const adminSetReviewApproval = async (req, res) => {
  try {
    await reviewModel.findByIdAndUpdate(req.body.id, { approved: !!req.body.approved });
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const adminDeleteReview = async (req, res) => {
  try {
    await reviewModel.findByIdAndDelete(req.body.id);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export { listProductReviews, listLatestReviews, addReview, adminListReviews, adminSetReviewApproval, adminDeleteReview };
