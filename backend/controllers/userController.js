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
      user.authProvider = "Email";
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

// Get user wishlist
const getWishlist = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);

    return res.json({ success: true, wishlistData: user?.wishlistData || {} });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// Add item to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { userId, itemId } = req.body;
    if (!itemId) {
      return res.json({ success: false, message: "Product id is required" });
    }

    const user = await userModel.findById(userId);
    const wishlistData = user?.wishlistData || {};
    wishlistData[itemId] = true;

    await userModel.findByIdAndUpdate(userId, { wishlistData });
    return res.json({ success: true, wishlistData });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// Remove item from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { userId, itemId } = req.body;
    if (!itemId) {
      return res.json({ success: false, message: "Product id is required" });
    }

    const user = await userModel.findById(userId);
    const wishlistData = user?.wishlistData || {};
    delete wishlistData[itemId];

    await userModel.findByIdAndUpdate(userId, { wishlistData });
    return res.json({ success: true, wishlistData });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// Merge guest wishlist into user wishlist
const mergeWishlist = async (req, res) => {
  try {
    const { userId, guestWishlist } = req.body;
    const user = await userModel.findById(userId);
    const wishlistData = user?.wishlistData || {};

    if (guestWishlist && typeof guestWishlist === "object") {
      for (const itemId in guestWishlist) {
        if (guestWishlist[itemId]) {
          wishlistData[itemId] = true;
        }
      }
    }

    await userModel.findByIdAndUpdate(userId, { wishlistData });
    return res.json({ success: true, wishlistData });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// Get logged-in user profile
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId, {
      name: 1,
      email: 1,
      authProvider: 1,
      createdAt: 1,
      wishlistData: 1,
      cartData: 1,
    });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// Update logged-in user profile (currently name only)
const updateUserProfile = async (req, res) => {
  try {
    const { userId, name } = req.body;

    if (!name || !name.trim()) {
      return res.json({ success: false, message: "Name is required" });
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return res.json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }

    const user = await userModel.findByIdAndUpdate(
      userId,
      { name: trimmedName },
      {
        new: true,
        projection: {
          name: 1,
          email: 1,
          authProvider: 1,
          createdAt: 1,
          wishlistData: 1,
          cartData: 1,
        },
      },
    );

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, user, message: "Profile updated" });
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
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  mergeWishlist,
  getUserProfile,
  updateUserProfile,
};
