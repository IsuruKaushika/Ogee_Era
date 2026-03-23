import express from "express";
import authUser from "../middleware/auth.js";

import {
  addToCart,
  getUserCart,
  updateCart,
  mergeCart,
} from "../controllers/cartController.js";

const cartRouter = express.Router();

cartRouter.post("/get", authUser, getUserCart);
cartRouter.post("/add", authUser, addToCart);
cartRouter.post("/update", authUser, updateCart);
cartRouter.post("/merge", authUser, mergeCart);

export default cartRouter;
