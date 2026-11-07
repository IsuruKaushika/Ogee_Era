import express from "express";
import { listProductReviews, listLatestReviews, addReview, adminListReviews, adminSetReviewApproval, adminDeleteReview } from "../controllers/reviewController.js";
import optionalAuth from "../middleware/optionalAuth.js";
import adminAuth from "../middleware/adminAuth.js";

const reviewRouter = express.Router();
reviewRouter.get("/latest", listLatestReviews);
reviewRouter.get("/product/:productId", listProductReviews);
reviewRouter.post("/add", optionalAuth, addReview);
reviewRouter.post("/admin/list", adminAuth, adminListReviews);
reviewRouter.post("/admin/approve", adminAuth, adminSetReviewApproval);
reviewRouter.post("/admin/delete", adminAuth, adminDeleteReview);
export default reviewRouter;
