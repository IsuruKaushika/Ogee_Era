import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: "" },
    authProvider: { type: String, enum: ["Email", "google"], default: "Email" },
    cartData: { type: Object, default: {} },
    wishlistData: { type: Object, default: {} },
  },
  { minimize: false, timestamps: true },
);

const userModel = mongoose.models.user || mongoose.model("User", userSchema);

export default userModel;
