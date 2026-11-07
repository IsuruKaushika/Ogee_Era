import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 800 },
    userId: { type: String, default: "guest" },
    verifiedBuyer: { type: Boolean, default: false },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.models.review || mongoose.model("review", reviewSchema);
