import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

// PayHere credentials from environment variables
const PAYHERE_MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID;
const PAYHERE_MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET;
const PAYHERE_SANDBOX = process.env.PAYHERE_SANDBOX === 'true';

const placeOrder = async(req, res) => {
    try {
        const {userId, items, amount, address} = req.body;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
            
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId, {cartData: {}})

        res.json({success: true, message: "Order Placed Successfully"})
    } catch(error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// Creating pending order for Payhere payment
// Creating pending order for Payhere payment
const createPendingOrder = async(req, res) => {
    try {
        const {userId, items, amount, address} = req.body;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "Payhere",
            payment: false,
            status: "pending",
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        // Generate the PayHere hash following their specifications
        // First hash the merchant secret
        const hashedSecret = crypto
            .createHash('md5')
            .update(PAYHERE_MERCHANT_SECRET)
            .digest('hex')
            .toUpperCase();
        
        // Format amount to ensure it has 2 decimal places
        const amountFormatted = parseFloat(amount)
            .toLocaleString('en-us', { minimumFractionDigits: 2 })
            .replaceAll(',', '');
        
        const currency = 'LKR'; // Set your default currency
        
        // Create the final hash
        const hash = crypto
            .createHash('md5')
            .update(PAYHERE_MERCHANT_ID + newOrder._id + amountFormatted + currency + hashedSecret)
            .digest('hex')
            .toUpperCase();

        // Return order ID, PayHere merchant ID, and hash for frontend processing
        res.json({
            success: true, 
            message: "Order Created Successfully",
            orderId: newOrder._id,
            merchantId: PAYHERE_MERCHANT_ID,
            hash: hash,
            currency: currency,
            sandbox: PAYHERE_SANDBOX
        })
    } catch(error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}
// Validate PayHere hash
const validatePayhereHash = (data, hash) => {
    // First hash the merchant secret
    const hashedSecret = crypto
        .createHash('md5')
        .update(PAYHERE_MERCHANT_SECRET)
        .digest('hex')
        .toUpperCase();
    
    // Format amount to ensure it has 2 decimal places
    const amountFormatted = parseFloat(data.payhere_amount)
        .toLocaleString('en-us', { minimumFractionDigits: 2 })
        .replaceAll(',', '');
    
    // Create the message string according to PayHere documentation
    const message = data.merchant_id + data.order_id + amountFormatted + data.payhere_currency + hashedSecret;
    
    // Create the hash using MD5
    const calculatedHash = crypto
        .createHash('md5')
        .update(message)
        .digest('hex')
        .toUpperCase();
    
    // Compare the calculated hash with the received hash
    return calculatedHash === hash;
};
// Handle PayHere payment notification
const payhereNotify = async(req, res) => {
    try {
        const { merchant_id, order_id, payment_id, payhere_amount, status_code, md5sig } = req.body;
        
        // Verify merchant ID
        if (merchant_id !== PAYHERE_MERCHANT_ID) {
            return res.status(400).json({success: false, message: 'Invalid merchant'});
        }
        
        // Verify hash (MD5 signature)
        if (!validatePayhereHash(req.body, md5sig)) {
            return res.status(400).json({success: false, message: 'Invalid signature'});
        }
        
        // Find the order
        const order = await orderModel.findById(order_id);
        if (!order) {
            return res.status(404).json({success: false, message: 'Order not found'});
        }
        
        // Update based on status code
        if (status_code === 2) {  // Payment successful
            // Update order status and payment info
            await orderModel.findByIdAndUpdate(order_id, { 
                status: 'Processing',
                payment: true,
                paymentId: payment_id,
                paymentDetails: req.body
            });
            
            // Clear cart after successful payment
            await userModel.findByIdAndUpdate(order.userId, {cartData: {}});
            
            return res.json({success: true, message: 'Payment verified and order updated'});
        } else {
            // Payment failed
            await orderModel.findByIdAndUpdate(order_id, { 
                status: 'Failed',
                paymentId: payment_id,
                paymentDetails: req.body
            });
            
            return res.json({success: false, message: 'Payment failed or canceled'});
        }
    } catch(error) {
        console.log(error);
        res.status(500).json({success: false, message: error.message});
    }
}

// Handle PayHere success return
const payhereSuccess = async(req, res) => {
    try {
        // This endpoint is for user redirect after payment
        // Redirect to orders page or success page
        res.json({success: true, message: "Payment completed successfully"});
    } catch(error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}

// Handle PayHere failure return
const payhereFailure = async(req, res) => {
    try {
        res.json({success: false, message: "Payment was not completed"});
    } catch(error) {
        console.log(error);
        res.json({success: false, message: error.message});
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
        const orders = await orderModel.find({})
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
        const orders = await orderModel.find({userId})
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

export {
    placeOrder, 
    userOrders, 
    updateStatus, 
    allOrders, 
    placeOrderWithCard,
    createPendingOrder,
    payhereNotify,
    payhereSuccess,
    payhereFailure
}