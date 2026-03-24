import express from "express";
import {
  loginUser,
  registerUser,
  adminLogin,
  resetPassword,
  googleAuthUser,
  listUsers,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  mergeWishlist,
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);
userRouter.post("/google", googleAuthUser);
userRouter.post("/list", adminAuth, listUsers);
userRouter.post("/wishlist/get", authUser, getWishlist);
userRouter.post("/wishlist/add", authUser, addToWishlist);
userRouter.post("/wishlist/remove", authUser, removeFromWishlist);
userRouter.post("/wishlist/merge", authUser, mergeWishlist);
userRouter.post("/me", authUser, getUserProfile);
userRouter.post("/profile/update", authUser, updateUserProfile);

userRouter.post("/reset-password", resetPassword);
export default userRouter;
