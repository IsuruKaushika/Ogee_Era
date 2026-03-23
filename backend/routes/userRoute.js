import express from "express";
import {
  loginUser,
  registerUser,
  adminLogin,
  resetPassword,
  googleAuthUser,
  listUsers,
} from "../controllers/userController.js";
import adminAuth from "../middleware/adminAuth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);
userRouter.post("/google", googleAuthUser);
userRouter.post("/list", adminAuth, listUsers);

userRouter.post("/reset-password", resetPassword);
export default userRouter;
