import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: "" },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    cartData: { type: Object, default: {} },
  },
  { minimize: false },
);

const userModel = mongoose.models.user || mongoose.model("User", userSchema);

export default userModel;
