import React, { useContext, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
// Add this import for MD5 hashing if needed for any client-side verification
import md5 from 'crypto-js/md5';

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const {navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products} = useContext(ShopContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: ''
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    setFormData(data => ({...data, [name]: value}));
  };

  const initiatePayherePayment = (orderData, orderId, merchantId, sandbox, hash) => {
    const paymentObject = {
      sandbox: sandbox, // Will be true in development, false in production
      merchant_id: merchantId,
      return_url: `${window.location.origin}/payment-success`,
      cancel_url: `${window.location.origin}/payment-failed`,
      notify_url: `${backendUrl}/api/order/payhere-notify`,
      order_id: orderId,
      items: orderData.items.map(item => `${item.name} (${item.size})`).join(", "),
      amount: orderData.amount,
      currency: "LKR", // Replace with your currency if different
      first_name: orderData.address.firstName,
      last_name: orderData.address.lastName,
      email: orderData.address.email,
      phone: orderData.address.phone,
      address: orderData.address.street,
      city: orderData.address.city,
      country: orderData.address.country,
      hash: hash, // Hash generated on the backend
    };

    // Create a form and submit it to PayHere
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = sandbox 
      ? 'https://sandbox.payhere.lk/pay/checkout' 
      : 'https://www.payhere.lk/pay/checkout';

    // Create and append input fields for each parameter
    Object.entries(paymentObject).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  // Function to add order to Google Sheets
  const addOrderToGoogleSheet = async (orderData, orderId, status) => {
    try {
      // Format items for Google Sheets
      const itemsFormatted = orderData.items.map(item => 
        `${item.name} (${item.size}) x ${item.quantity}`
      ).join("; ");
      
      // Format address for Google Sheets
      const fullAddress = `${orderData.address.street}, ${orderData.address.city}, ${orderData.address.state}, ${orderData.address.zipcode}, ${orderData.address.country}`;
      
      // Create data object for Google Sheets
      const sheetData = {
        orderId: orderId,
        orderStatus: status,
        customerName: `${orderData.address.firstName} ${orderData.address.lastName}`,
        email: orderData.address.email,
        address: fullAddress,
        items: itemsFormatted,
        phoneNumber: orderData.address.phone,
        paymentMethod: orderData.payment_method,
        amount: orderData.amount,
        orderedDate: new Date().toISOString()
      };
      
      // Google Apps Script web app URL - Replace with your deployed web app URL
      const googleSheetsUrl = "https://script.google.com/macros/s/AKfycby7DDOdCEGRVUtOPGaULYkqRmFIM-3GJaQYA2Esufme4KOPn0aCTlmFwX18iu5T_vGtIQ/exec";
      
      // Send data to Google Sheets
      const response = await axios.post(googleSheetsUrl, sheetData);
      
      // Log success but don't block the main flow
      console.log("Order added to Google Sheet:", response.data);
    } catch (error) {
      // Log error but don't block the main flow
      console.error("Failed to add order to Google Sheet:", error);
      // We don't want to show an error toast here as it would confuse the user
      // The order has been processed in the system, this is just a logging issue
    }
  };

  const onSubmitHandler = async(event) => {
    event.preventDefault();
    
    if (isSubmitting) {
      return; // Prevent multiple submissions
    }
    
    setIsSubmitting(true);
    
    try {
      let orderItems = [];

      for(const items in cartItems) {
        for(const item in cartItems[items]) {
          if(cartItems[items][item] > 0) {
            const itemInfo = structuredClone(products.find(product => product._id === items));
            if(itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item];
              orderItems.push(itemInfo);
            }
          }
        }
      }
      
      let orderData = {
        userId: localStorage.getItem('userId'), // Assuming you store userId in localStorage
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
        payment_method: method
      };
      
      switch(method) {
        // API calls COD
        case 'cod':
          const response = await axios.post(backendUrl + '/api/order/place', orderData, {headers: {token}});
          
          if(response.data.success) {
            // Add order to Google Sheet
            await addOrderToGoogleSheet(orderData, response.data.orderId, "Placed");
            
            toast.success(response.data.message);
            setCartItems({});
            navigate('/orders');
          } else {
            toast.error(response.data.message);
          }
          break;

        case 'payhere':
          // First create an order with 'pending' status
          const payhereResponse = await axios.post(
            backendUrl + '/api/order/create-pending', 
            orderData, 
            {headers: {token}}
          );
          
          if(payhereResponse.data.success) {
            // Add order to Google Sheet with pending status
            await addOrderToGoogleSheet(orderData, payhereResponse.data.orderId, "Pending Payment");
            
            // Initiate PayHere payment with the order ID, merchant ID, and hash received from backend
            initiatePayherePayment(
              orderData, 
              payhereResponse.data.orderId,
              payhereResponse.data.merchantId,
              payhereResponse.data.sandbox,
              payhereResponse.data.hash // Pass the hash from backend
            );
            setCartItems({});
            
          } else {
            toast.error(payhereResponse.data.message || 'Failed to create order');
          }
          break;

        default:
          break;
      }
    } catch(error) {
      console.log(error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] px-4">
      {/* ---------- Left Side (Delivery Information) ---------- */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} className="border p-2 rounded w-full" type="text" placeholder="First name" />
          <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} className="border p-2 rounded w-full" type="text" placeholder="Last name" />
        </div>
        <input required onChange={onChangeHandler} name='email' value={formData.email} className="border p-2 rounded w-full" type="email" placeholder="Email address" />
        <input required onChange={onChangeHandler} name='street' value={formData.street} className="border p-2 rounded w-full" type="text" placeholder="Street" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input required onChange={onChangeHandler} name='city' value={formData.city} className="border p-2 rounded w-full" type="text" placeholder="City" />
          <input required onChange={onChangeHandler} name='state' value={formData.state} className="border p-2 rounded w-full" type="text" placeholder="State" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input required onChange={onChangeHandler} name='zipcode' value={formData.zipcode} className="border p-2 rounded w-full" type="text" placeholder="Zipcode" />
          <input required onChange={onChangeHandler} name='country' value={formData.country} className="border p-2 rounded w-full" type="text" placeholder="Country" />
        </div>

        <input required onChange={onChangeHandler} name='phone' value={formData.phone} className="border p-2 rounded w-full" type="tel" placeholder="Phone" />
      </div>

      {/* ---------- Right Side (Cart Totals) ---------- */}

      <div className="mt-8 w-full sm:max-w-[480px]">
        <div className="mt-8">
          <CartTotal />
        </div>

        <div className="mt-12">
          <Title text1={"PAYMENT"} text2={"METHOD"} />
          {/*----Payment Method----*/}
          <div className="flex gap-3 flex-col lg:flex-row">
            {/* PayHere Payment */}
            <div
              onClick={() => setMethod("payhere")}
              className={`flex items-center gap-3 border p-2 px-3 cursor-pointer ${
                method === "payhere" ? "border-green-500" : "border-gray-300"
              }`}
            >
              <p
                className={`w-3.5 h-3.5 border rounded-full ${
                  method === "payhere" ? "bg-green-400" : "bg-gray-300"
                }`}
              ></p>
              <p className="text-blue-600 text-sm font-medium mx-4">CARD PAYMENT</p>
            </div>

            {/* Cash on Delivery (COD) */}
            <div
              onClick={() => setMethod("cod")}
              className={`flex items-center gap-3 border p-2 px-3 cursor-pointer ${
                method === "cod" ? "border-green-500" : "border-gray-300"
              }`}
            >
              <p
                className={`w-3.5 h-3.5 border rounded-full ${
                  method === "cod" ? "bg-green-400" : "bg-gray-300"
                }`}
              ></p>
              <p className="text-gray-500 text-sm font-medium mx-4">CASH ON DELIVERY</p>
            </div>
          </div>
        </div>

        {/* ---- Place Order Button ---- */}
        <button 
          type='submit' 
          disabled={isSubmitting}
          className={`w-full mt-6 ${isSubmitting ? 'bg-gray-500' : 'bg-black hover:bg-gray-800'} text-white py-3 rounded-md text-lg font-medium transition`}
        >
          {isSubmitting ? 'Processing...' : (method === 'payhere' ? 'Pay Now' : 'Place Order')}
        </button>
      </div>
    </form>
  );
};

export default PlaceOrder;