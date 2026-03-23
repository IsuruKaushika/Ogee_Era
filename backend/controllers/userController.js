import validator from "validator";
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client();

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User Not Found" });
    }

    if (!user.password) {
      return res.json({
        success: false,
        message: "This account uses Google Sign-In",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = createToken(user._id);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Incorrect Password" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Google login/signup
const googleAuthUser = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.json({ success: false, message: "Google token is required" });
    }

    const audience = process.env.GOOGLE_CLIENT_ID;
    if (!audience) {
      return res.json({
        success: false,
        message: "Google auth is not configured on server",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.json({
        success: false,
        message: "Google account email not available",
      });
    }

    const email = payload.email.toLowerCase();
    let user = await userModel.findOne({ email });

    if (!user) {
      user = await userModel.create({
        name: payload.name || email.split("@")[0],
        email,
        authProvider: "google",
      });
    } else if (!user.authProvider) {
      user.authProvider = "local";
      await user.save();
    }

    const token = createToken(user._id);
    return res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Google authentication failed",
    });
  }
};

// Register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already registered" });
    }

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please Enter Your Valid Email",
      });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Enter a strong Password " });
    }

    // Hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Simple password reset
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Validate inputs
    if (!email || !newPassword) {
      return res.json({
        success: false,
        message: "Email and new password are required.",
      });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password (at least 8 characters).",
      });
    }

    // Find the user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "User not found with this email.",
      });
    }

    // Hash and update password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    return res.json({
      success: true,
      message:
        "Password reset successful. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Error in reset-password:", error);
    return res.json({
      success: false,
      message: "An error occurred while resetting your password.",
    });
  }
};

// List customers for admin panel
const listUsers = async (req, res) => {
  try {
    const users = await userModel
      .find({}, { password: 0, cartData: 0, __v: 0 })
      .sort({ _id: -1 });

    return res.json({ success: true, users });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export {
  loginUser,
  registerUser,
  adminLogin,
  resetPassword,
  googleAuthUser,
  listUsers,
};
