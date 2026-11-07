import express from "express";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";
import { getPublicSettings, adminGetSettings, adminUpdateSettings, adminUploadImage } from "../controllers/settingsController.js";

const settingsRouter = express.Router();
settingsRouter.get("/", getPublicSettings);
settingsRouter.post("/admin/get", adminAuth, adminGetSettings);
settingsRouter.post("/admin/update", adminAuth, adminUpdateSettings);
settingsRouter.post("/admin/upload", adminAuth, upload.single("image"), adminUploadImage);
export default settingsRouter;
