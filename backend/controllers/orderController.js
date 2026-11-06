import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import dotenv from 'dotenv';
import crypto from 'crypto';
import { sendOrderConfirmationEmail } from "../config/email.js";
import productModel from "../models/productModel.js";
import { deliveryFeeFor, statusFromStock } from "../config/shop.js";
import { GUEST_ID } from "../middleware/optionalAuth.js";

// Load environment variables
dotenv.config();

// PayHere credentials from environment variables
const PAYHERE_MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID;
const PAYHERE_MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET;
const PAYHERE_SANDBOX = process.env.PAYHERE_SANDBOX === "true";

// A PayHere order that was never paid is only a payment attempt, not a real order.
// COD orders (payment: false by design) and paid PayHere orders are real orders.
const REAL_ORDERS_FILTER = {
  $or: [{ paymentMethod: { $ne: "Payhere" } }, { payment: true }],
};

// Confirmation goes to the logged-in account's email; falls back to the checkout form email
const getCustomerEmail = async (userId, address) => {
  if (!userId || userId === "guest") return address?.email;
  try {
    const user = await userModel.findById(userId).select("email");
    if (user?.email) return user.email;
  } catch (err) {
    console.error("Could not look up user email:", err.message);
  }
  return address?.email;
};


const isGuest = (userId) => !userId || userId === GUEST_ID;

const clearUserCart = async (userId) => {
  if (!isGuest(userId)) await userModel.findByIdAndUpdate(userId, { cartData: {} });
};

// Never trust prices or totals sent by the browser: rebuild the order from the product database.
class OrderError extends Error {}

const buildOrderFromCart = async (rawItems) => {
  if (!Array.isArray(rawItems) || rawItems.length === 0) throw new OrderError("Your cart is empty");

  // Merge duplicate product ids so stock is checked against the total quantity wanted
  const wanted = {};
  for (const it of rawItems) {
    const id = String(it?._id || "");
    const qty = Math.floor(Number(it?.quantity));
    if (!id || !(qty > 0)) throw new OrderError("Invalid item in cart");
    wanted[id] = (wanted[id] || 0) + qty;
  }
  const products = await productModel.find({ _id: { $in: Object.keys(wanted) } }).lean();
  const byId = Object.fromEntries(products.map((p) => [String(p._id), p]));

  const items = [];
  let subtotal = 0;
  for (const it of rawItems) {
    const product = byId[String(it._id)];
    if (!product) throw new OrderError("An item in your cart is no longer available");
    if (product.stockStatus === "Out of Stock") throw new OrderError(`${product.name} is sold out`);
    if (typeof product.stock === "number" && wanted[String(product._id)] > product.stock) {
      throw new OrderError(`Only ${product.stock} left of ${product.name}`);
    }
    const size = String(it.size || "default");
    if (product.sizes?.length && size !== "default" && !product.sizes.includes(size)) {
      throw new OrderError(`Size ${size} is not available for ${product.name}`);
    }
    const quantity = Math.floor(Number(it.quantity));
    const unit = product.discount ? product.price * (1 - product.discount / 100) : product.price;
    subtotal += unit * quantity;
    items.push({ ...product, size, quantity });
  }
  subtotal = Math.round(subtotal * 100) / 100;
  const deliveryFee = deliveryFeeFor(subtotal);
  return { items, subtotal, deliveryFee, amount: Math.round((subtotal + deliveryFee) * 100) / 100 };
};

const sanitizeAddress = (a = {}) => {
  const clean = (v, max = 200) => String(v ?? "").trim().slice(0, max);
  return {
    firstName: clean(a.firstName, 60), lastName: clean(a.lastName, 60), email: clean(a.email, 120),
    street: clean(a.street), city: clean(a.city, 80), state: clean(a.state, 80),
    zipcode: clean(a.zipcode, 12), country: clean(a.country || "Sri Lanka", 60),
    phone: clean(a.phone, 20),
  };
};

// Reduce managed stock once an order is confirmed (COD placed, or PayHere paid).
const decrementStock = async (items) => {
  for (const it of items) {
    const p = await productModel.findById(it._id);
    if (!p || typeof p.stock !== "number") continue;
    p.stock = Math.max(0, p.stock - Number(it.quantity || 0));
    p.stockStatus = statusFromStock(p.stock);
    await p.save();
  }
};

// Mirror each order to the shop's Google Sheet from the server so it is never lost
// when a customer closes the browser. URL can be overridden with GOOGLE_SHEET_URL.
const DEFAULT_SHEET_URL =
  "https://script.google.com/macros/s/AKfycby7DDOdCEGRVUtOPGaULYkqRmFIM-3GJaQYA2Esufme4KOPn0aCTlmFwX18iu5T_vGtIQ/exec";
const logOrderToSheet = async (order, status) => {
  try {
    const a = order.address || {};
    await fetch(process.env.GOOGLE_SHEET_URL || DEFAULT_SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        orderId: String(order._id),
        orderStatus: status,
        customerName: `${a.firstName} ${a.lastName}`,
        email: a.email,
        address: [a.street, a.city, a.state, a.zipcode, a.country].filter(Boolean).join(", "),
        items: order.items.map((i) => `${i.name} (${i.size}) x ${i.quantity}`).join("; "),
        phoneNumber: a.phone,
        paymentMethod: order.paymentMethod,
        amount: order.amount,
        orderedDate: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.error("Google Sheet log failed:", err.message);
  }
};

const sendConfirmation = async (order) => {
  const to = await getCustomerEmail(order.userId, order.address);
  if (!to) return;
  try {
    await sendOrderConfirmationEmail({
      to, orderId: order._id, items: order.items, amount: order.amount,
      address: order.address, paymentMethod: order.paymentMethod,
    });
  } catch (emailErr) {
    console.error("Failed to send order confirmation email:", emailErr.message);
  }
};

const placeOrder = async (req, res) => {
  try {
    const { userId, items: rawItems, address } = req.body;
    const built = await buildOrderFromCart(rawItems);

    const newOrder = new orderModel({
      userId,
      items: built.items,
      address: sanitizeAddress(address),
      amount: built.amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    });
    await newOrder.save();
    await decrementStock(built.items);
    await clearUserCart(userId);
    // Not awaited so the customer is not kept waiting on email / sheet
    sendConfirmation(newOrder);
    logOrderToSheet(newOrder, "Order Placed");

    res.json({ success: true, message: "Order Placed Successfully", orderId: newOrder._id, amount: built.amount });
  } catch (error) {
    if (!(error instanceof OrderError)) console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Creating pending order for Payhere payment
const createPendingOrder = async (req, res) => {
  try {
    const { userId, items: rawItems, address } = req.body;
    const built = await buildOrderFromCart(rawItems);

    const newOrder = new orderModel({
      userId,
      items: built.items,
      address: sanitizeAddress(address),
      amount: built.amount,
      paymentMethod: "Payhere",
      payment: false,
      status: "Pending Payment",
      date: Date.now(),
    });
    await newOrder.save();
    logOrderToSheet(newOrder, "Pending Payment");

    const hashedSecret = crypto
      .createHash("md5")
      .update(PAYHERE_MERCHANT_SECRET)
      .digest("hex")
      .toUpperCase();

    const amountFormatted = built.amount
      .toLocaleString("en-us", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      .replaceAll(",", "");

    const currency = "LKR";
    const hash = crypto
      .createHash("md5")
      .update(PAYHERE_MERCHANT_ID + newOrder._id + amountFormatted + currency + hashedSecret)
      .digest("hex")
      .toUpperCase();

    res.json({
      success: true,
      message: "Order Created Successfully",
      orderId: newOrder._id,
      merchantId: PAYHERE_MERCHANT_ID,
      hash,
      currency,
      amount: built.amount,
      sandbox: PAYHERE_SANDBOX,
    });
  } catch (error) {
    if (!(error instanceof OrderError)) console.log(error);
    res.json({ success: false, message: error.message });
  }
};
// Validate PayHere hash
const validatePayhereHash = (data, hash) => {
  // First hash the merchant secret
  const hashedSecret = crypto
    .createHash("md5")
    .update(PAYHERE_MERCHANT_SECRET)
    .digest("hex")
    .toUpperCase();

  // Format amount to ensure it has 2 decimal places
  const amountFormatted = parseFloat(data.payhere_amount)
    .toLocaleString("en-us", { minimumFractionDigits: 2 })
    .replaceAll(",", "");

  // Create the message string according to PayHere documentation
  const message =
    data.merchant_id +
    data.order_id +
    amountFormatted +
    data.payhere_currency +
    data.status_code + // ✅ add this
    hashedSecret;

  // Create the hash using MD5
  const calculatedHash = crypto
    .createHash("md5")
    .update(message)
    .digest("hex")
    .toUpperCase();

  // Compare the calculated hash with the received hash
  return calculatedHash === hash;
};
// Handle PayHere payment notification
const payhereNotify = async (req, res) => {
  try {
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      status_code,
      md5sig,
    } = req.body;

    // Verify merchant ID
    if (merchant_id !== PAYHERE_MERCHANT_ID) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid merchant" });
    }

    // Verify hash (MD5 signature)
    if (!validatePayhereHash(req.body, md5sig)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    // Find the order
    const order = await orderModel.findById(order_id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Update based on status code
    if (status_code === "2") {
      // Payment successful
      // Update order status and payment info
      const wasPending = order.status === "Pending Payment";
      await orderModel.findByIdAndUpdate(order_id, {
        status: "Order Placed",
        payment: true,
        paymentId: payment_id,
        paymentDetails: req.body,
      });

      // Stock is reduced only once, when the payment is first confirmed
      if (wasPending) await decrementStock(order.items);
      await clearUserCart(order.userId);
      sendConfirmation(order);
      logOrderToSheet(order, "Order Placed (Paid)");

      return res.json({
        success: true,
        message: "Payment verified and order updated",
      });
    } else {
      // Payment failed
      await orderModel.findByIdAndUpdate(order_id, {
        status: "Failed",
        paymentId: payment_id,
        paymentDetails: req.body,
      });

      return res.json({
        success: false,
        message: "Payment failed or canceled",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Handle PayHere success return
const payhereSuccess = async(req, res) => {
    try {
        // This endpoint is for user redirect after payment
        // Redirect to orders page or success page
        
        // await newOrder.save()

        // await userModel.findByIdAndUpdate(userId, {cartData: {}})
        
        res.json({success: true, message: "Payment completed successfully"});
        

    } catch(error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}


//This endpoint is for user redirect after payment

// Handle PayHere failure return
const payhereFailure = async(req, res) => {
    try {
        res.json({success: false, message: "Payment was not completed"});
    } catch(error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

// Customer cancelled on the PayHere page: mark the unpaid attempt as Cancelled
const cancelPendingOrder = async (req, res) => {
    try {
        const { userId, orderId } = req.body;
        const order = await orderModel.findById(orderId);
        if (
            order &&
            order.userId === userId &&
            order.paymentMethod === "Payhere" &&
            !order.payment &&
            order.status === "Pending Payment"
        ) {
            await orderModel.findByIdAndUpdate(orderId, { status: "Cancelled" });
        }
        res.json({ success: true });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Keeping your original placeOrderWithCard function for compatibility
const placeOrderWithCard = async(req, res) => {
    // Redirect to createPendingOrder for PayHere processing
    return await createPendingOrder(req, res);
}

// All Orders Data from Admin Panel
const allOrders = async(req, res) => {
    try {
        // Unpaid PayHere attempts are hidden unless explicitly requested
        const filter = req.body?.includeUnpaid ? {} : REAL_ORDERS_FILTER;
        const orders = await orderModel.find(filter)
        res.json({success: true, orders})
    } catch(error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// User ordered data for frontend
const userOrders = async(req, res) => {
    try {
        const {userId} = req.body;
        const orders = await orderModel.find({userId, ...REAL_ORDERS_FILTER})
        res.json({success: true, orders})
    } catch(error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// Update order status from admin
const updateStatus = async(req, res) => {
    try {
        const {orderId, status} = req.body;
        await orderModel.findByIdAndUpdate(orderId, {status})
        res.json({success: true, message: "Order Status Updated Successfully"})
    } catch(error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// Delete order from admin
const deleteOrder = async(req, res) => {
    try {
        const {orderId, orderIds} = req.body;
        
        if (orderIds && Array.isArray(orderIds)) {
            await orderModel.deleteMany({ _id: { $in: orderIds } });
            return res.json({ success: true, message: "Orders deleted successfully" });
        }

        // Check if order exists
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({success: false, message: "Order not found"});
        }
        
        // Delete the order
        await orderModel.findByIdAndDelete(orderId);
        
        res.json({success: true, message: "Order deleted successfully"});
    } catch(error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

export {
    placeOrder, 
    userOrders, 
    updateStatus, 
    allOrders, 
    placeOrderWithCard,
    createPendingOrder,
    payhereNotify,
    payhereSuccess,
    payhereFailure,
    cancelPendingOrder,
    deleteOrder
}