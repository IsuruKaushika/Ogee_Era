import userModel from "../models/userModel.js";

//import routes

//Add products to user Card
const addToCart = async (req, res) => {
  try {
    const { userId, itemId, size } = req.body;

    const userData = await userModel.findById(userId);
    let cartData = await userData.cartData;

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: "Item added to cart" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const updateCart = async (req, res) => {
  try {
    const { userId, itemId, size, quantity } = req.body;
    const userData = await userModel.findById(userId);
    let cartData = await userData.cartData;

    cartData[itemId][size] = quantity;
    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: "Cart Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const getUserCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await userModel.findById(userId);
    let cartData = await userData.cartData;
    res.json({ success: true, cartData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Merge guest cart into logged-in user cart
const mergeCart = async (req, res) => {
  try {
    const { userId, guestCart } = req.body;

    const userData = await userModel.findById(userId);
    let cartData = userData?.cartData || {};

    if (guestCart && typeof guestCart === "object") {
      for (const itemId in guestCart) {
        if (!cartData[itemId]) {
          cartData[itemId] = {};
        }

        const sizes = guestCart[itemId] || {};
        for (const size in sizes) {
          const guestQty = Number(sizes[size]) || 0;
          if (guestQty <= 0) continue;

          const existingQty = Number(cartData[itemId][size]) || 0;
          cartData[itemId][size] = existingQty + guestQty;
        }
      }
    }

    await userModel.findByIdAndUpdate(userId, { cartData });
    return res.json({ success: true, cartData });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export { addToCart, updateCart, getUserCart, mergeCart };
