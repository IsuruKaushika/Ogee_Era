import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import dotenv from 'dotenv';
import crypto from 'crypto';
import { sendOrderConfirmationEmail } from "../config/email.js";
import productModel from "../models/productModel.js";
import { statusFromStock } from "../config/shop.js";
import { getSettings, deliveryFeeFor } from "../config/settings.js";
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
  const deliveryFee = deliveryFeeFor(await getSettings(), subtotal);
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
// One atomic update per product, so two simultaneous orders cannot both take the last item.
const adjustStock = async (items, direction) => {
  for (const it of items) {
    const qty = Number(it.quantity || 0) * direction;
    if (!qty) continue;
    const p = await productModel.findOneAndUpdate(
      { _id: it._id, stock: { $type: "number" } },
      [{ $set: { stock: { $max: [0, { $subtract: ["$stock", qty] }] } } }],
      { new: true },
    );
    if (p) await productModel.updateOne({ _id: p._id }, { stockStatus: statusFromStock(p.stock) });
  }
};
const decrementStock = (items) => adjustStock(items, 1);
const restoreStock = (items) => adjustStock(items, -1);

// Mirror each order to the Google Sheet from the server so it is never lost when a customer closes
// the browser. The URL is set in the admin panel (Settings) or GOOGLE_SHEET_URL; skipped if neither is set.
const logOrderToSheet = async (order, status) => {
  try {
    const a = order.address || {};
    const sheetUrl = (await getSettings()).orderSheetUrl || process.env.GOOGLE_SHEET_URL;
    if (!sheetUrl) return;
    await fetch(sheetUrl, {
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

    // The paid amount must match what we charged for this order
    if (
      status_code === "2" &&
      (Math.abs(Number(payhere_amount) - Number(order.amount)) > 0.01 || req.body.payhere_currency !== "LKR")
    ) {
      console.error(`PayHere amount mismatch for order ${order_id}: got ${payhere_amount} ${req.body.payhere_currency}, expected ${order.amount} LKR`);
      return res.status(400).json({ success: false, message: "Amount mismatch" });
    }

    // Update based on status code
    if (status_code === "2") {
      // Payment successful
      // Update order status and payment info
      const wasPending = order.status === "Pending Payment";
      await orderModel.findByIdAndUpdate(order_id, {
        status: "Order Placed",
        payment: true,
        paidAt: order.paidAt || Date.now(),
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
      // Payment failed (ignored if the order was already paid)
      if (order.payment) return res.json({ success: true, message: "Order already paid" });
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

const ORDER_STATUSES = ["Order Placed", "Packing", "Delivered", "Cancelled"];

// Update order status from admin
const updateStatus = async(req, res) => {
    try {
        const {orderId, status} = req.body;
        if (!ORDER_STATUSES.includes(status)) {
            return res.json({success: false, message: "Invalid status"});
        }
        const order = await orderModel.findById(orderId);
        if (!order) return res.json({success: false, message: "Order not found"});

        const update = {status};
        // Cash on delivery is paid when the parcel is handed over
        if (status === "Delivered" && order.paymentMethod === "COD" && !order.payment) {
            update.payment = true;
            update.paidAt = Date.now();
        }
        // Moving a COD order back from Delivered means the cash was not collected after all
        if (status !== "Delivered" && order.paymentMethod === "COD" && order.status === "Delivered") {
            update.payment = false;
            update.paidAt = null;
        }
        // Cancelling a confirmed order puts its stock back (once)
        if (status === "Cancelled" && !order.stockReleased && (order.paymentMethod === "COD" || order.payment)) {
            await restoreStock(order.items);
            update.stockReleased = true;
        }
        // Re-opening a cancelled order takes the stock again
        if (status !== "Cancelled" && order.status === "Cancelled" && order.stockReleased) {
            await decrementStock(order.items);
            update.stockReleased = false;
        }
        await orderModel.findByIdAndUpdate(orderId, update);
        res.json({success: true, message: "Order Status Updated Successfully"})
    } catch(error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// Orders are a permanent record (needed for income reports and accounts), so they are never deleted.
// Use the Cancelled status instead.
const deleteOrder = async(req, res) => {
    res.json({success: false, message: "Orders are kept permanently and cannot be deleted. Set the status to Cancelled instead."});
}

// ---- Income / sales report ----
const LK_OFFSET_MS = 5.5 * 60 * 60 * 1000; // report days follow Sri Lanka time
const dayKey = (ms) => new Date(ms + LK_OFFSET_MS).toISOString().slice(0, 10);
const round2 = (n) => Math.round(n * 100) / 100;
const unitPrice = (it) => Number(it.discount) > 0 ? Number(it.price) * (1 - Number(it.discount) / 100) : Number(it.price || 0);

// Everything the admin Reports page shows. Optional body: { from: "YYYY-MM-DD", to: "YYYY-MM-DD" } (inclusive).
const orderReport = async (req, res) => {
    try {
        const { from, to } = req.body || {};
        const range = {};
        if (from) range.$gte = Date.parse(`${from}T00:00:00+05:30`);
        if (to) range.$lte = Date.parse(`${to}T23:59:59.999+05:30`);
        const filter = { ...REAL_ORDERS_FILTER };
        if (Object.keys(range).length) filter.date = range;

        const orders = await orderModel.find(filter).sort({ date: 1 }).lean();

        const active = orders.filter((o) => !["Cancelled", "Failed", "Pending Payment"].includes(o.status));
        const cancelled = orders.filter((o) => o.status === "Cancelled");

        const sum = (list, f) => round2(list.reduce((t, o) => t + f(o), 0));
        const itemsTotal = (o) => (o.items || []).reduce((t, it) => t + unitPrice(it) * Number(it.quantity || 0), 0);

        const revenue = sum(active, (o) => o.amount);
        const summary = {
            orders: active.length,
            revenue,                                                                      // all confirmed orders, incl. delivery fees
            productSales: sum(active, itemsTotal),                                        // items only
            deliveryFees: sum(active, (o) => Math.max(0, Number(o.amount) - itemsTotal(o))),
            collected: sum(active.filter((o) => o.payment), (o) => o.amount),             // money actually received
            outstanding: sum(active.filter((o) => !o.payment), (o) => o.amount),          // COD not yet delivered / paid
            itemsSold: active.reduce((t, o) => t + (o.items || []).reduce((n, it) => n + Number(it.quantity || 0), 0), 0),
            averageOrder: active.length ? round2(revenue / active.length) : 0,
            cancelledOrders: cancelled.length,
            cancelledValue: sum(cancelled, (o) => o.amount),
            customers: new Set(active.map((o) => (o.address?.email || o.address?.phone || o.userId || "").toLowerCase())).size,
        };

        const group = (list, keyFn) => {
            const m = {};
            for (const o of list) {
                const k = keyFn(o) || "Unknown";
                m[k] = m[k] || { key: k, orders: 0, revenue: 0, collected: 0 };
                m[k].orders += 1;
                m[k].revenue += Number(o.amount || 0);
                if (o.payment) m[k].collected += Number(o.amount || 0);
            }
            return Object.values(m).map((r) => ({ ...r, revenue: round2(r.revenue), collected: round2(r.collected) }));
        };

        const byDay = group(active, (o) => dayKey(o.date)).sort((a, b) => a.key.localeCompare(b.key));
        const byMonth = group(active, (o) => dayKey(o.date).slice(0, 7)).sort((a, b) => a.key.localeCompare(b.key));
        const byMethod = group(active, (o) => o.paymentMethod).sort((a, b) => b.revenue - a.revenue);
        const byDistrict = group(active, (o) => o.address?.state).sort((a, b) => b.revenue - a.revenue).slice(0, 15);
        const byStatus = group(orders, (o) => o.status).sort((a, b) => b.orders - a.orders);

        const prod = {};
        for (const o of active) {
            for (const it of o.items || []) {
                const k = String(it._id || it.name);
                prod[k] = prod[k] || { name: it.name || "Unnamed", quantity: 0, revenue: 0 };
                prod[k].quantity += Number(it.quantity || 0);
                prod[k].revenue += unitPrice(it) * Number(it.quantity || 0);
            }
        }
        const topProducts = Object.values(prod)
            .map((p) => ({ ...p, revenue: round2(p.revenue) }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 15);

        // One row per order for the table and CSV export (newest first)
        const rows = [...orders].reverse().map((o) => ({
            id: String(o._id),
            date: o.date,
            customer: `${o.address?.firstName || ""} ${o.address?.lastName || ""}`.trim(),
            phone: o.address?.phone || "",
            email: o.address?.email || "",
            district: o.address?.state || "",
            items: (o.items || []).map((i) => `${i.name} (${i.size}) x${i.quantity}`).join("; "),
            method: o.paymentMethod,
            paid: !!o.payment,
            status: o.status,
            amount: Number(o.amount || 0),
        }));

        res.json({ success: true, summary, byDay, byMonth, byMethod, byDistrict, byStatus, topProducts, rows });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
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
    deleteOrder,
    orderReport
}