import React, { useContext, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import { validatePlaceOrderForm } from "../utils/validatePlaceOrderForm";
import PlaceOrderSkeleton from "../components/PlaceOrderSkeleton";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    currency,
    getCartAmount,
    getCartDiscount,
    delivery_fee,
    products,
    isProductsLoading,
  } = useContext(ShopContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});

  const orderItems = [];
  for (const productId in cartItems) {
    for (const size in cartItems[productId]) {
      if (cartItems[productId][size] > 0) {
        const itemInfo = structuredClone(products.find((product) => product._id === productId));
        if (itemInfo) {
          itemInfo.size = size;
          itemInfo.quantity = cartItems[productId][size];
          orderItems.push(itemInfo);
        }
      }
    }
  }

  const cartSubtotal = Number(getCartAmount()) || 0;
  const cartDiscount = Number(getCartDiscount()) || 0;
  const hasOrderItems = orderItems.length > 0 && cartSubtotal > 0;

  if (isProductsLoading) {
    return <PlaceOrderSkeleton />;
  }

  if (!hasOrderItems) {
    return (
      <div className="border-t pt-14 min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="text-2xl mb-3">
          <Title text1={"YOUR"} text2={"CART"} />
        </div>
        <p className="text-gray-600 mb-6">
          Your cart is currently empty. Add items before placing an order.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/cart")}
            className="bg-gray-100 text-gray-800 px-6 py-3 text-sm rounded"
          >
            VIEW CART
          </button>
          <button
            onClick={() => navigate("/collection")}
            className="bg-black text-white px-6 py-3 text-sm rounded"
          >
            SHOP NOW
          </button>
        </div>
      </div>
    );
  }

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    setFormData((data) => ({ ...data, [name]: value }));
  };

  const initiatePayherePayment = (orderData, orderId, merchantId, sandbox, hash) => {
    const paymentObject = {
      sandbox: sandbox, // Will be true in development, false in production
      merchant_id: merchantId,
      return_url: `${window.location.origin}/payment-success`,
      cancel_url: `${window.location.origin}/payment-failed`,
      notify_url: `${backendUrl}/api/order/payhere-notify`,
      order_id: orderId,
      items: orderData.items.map((item) => `${item.name} (${item.size})`).join(", "),
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
    const form = document.createElement("form");
    form.method = "POST";
    form.action = sandbox
      ? "https://sandbox.payhere.lk/pay/checkout"
      : "https://www.payhere.lk/pay/checkout";

    // Create and append input fields for each parameter
    Object.entries(paymentObject).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
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
      const itemsFormatted = orderData.items
        .map((item) => `${item.name} (${item.size}) x ${item.quantity}`)
        .join("; ");

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
        orderedDate: new Date().toISOString(),
      };

      // Google Apps Script web app URL - Replace with your deployed web app URL
      const googleSheetsUrl =
        "https://script.google.com/macros/s/AKfycby7DDOdCEGRVUtOPGaULYkqRmFIM-3GJaQYA2Esufme4KOPn0aCTlmFwX18iu5T_vGtIQ/exec";

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

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return; // Prevent multiple submissions
    }

    if (!hasOrderItems) {
      toast.error("Your cart is empty. Add products before checkout.");
      navigate("/cart");
      return;
    }

    const { isValid, errors: validationErrors } = await validatePlaceOrderForm(formData);

    if (!isValid) {
      setErrors(validationErrors);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      let orderData = {
        userId: localStorage.getItem("userId"), // Assuming you store userId in localStorage
        address: formData,
        items: orderItems,
        amount: cartSubtotal - cartDiscount + delivery_fee,
        payment_method: method,
      };

      switch (method) {
        // API calls COD
        case "cod":
          const response = await axios.post(backendUrl + "/api/order/place", orderData, {
            headers: { token },
          });

          if (response.data.success) {
            // Add order to Google Sheet
            await addOrderToGoogleSheet(orderData, response.data.orderId, "Placed");

            toast.success(response.data.message);
            setCartItems({});
            navigate("/orders");
          } else {
            toast.error(response.data.message);
          }
          break;

        case "payhere":
          // First create an order with 'pending' status
          const payhereResponse = await axios.post(
            backendUrl + "/api/order/create-pending",
            orderData,
            { headers: { token } },
          );

          if (payhereResponse.data.success) {
            // Add order to Google Sheet with pending status
            await addOrderToGoogleSheet(orderData, payhereResponse.data.orderId, "Pending Payment");

            // Initiate PayHere payment with the order ID, merchant ID, and hash received from backend
            initiatePayherePayment(
              orderData,
              payhereResponse.data.orderId,
              payhereResponse.data.merchantId,
              payhereResponse.data.sandbox,
              payhereResponse.data.hash, // Pass the hash from backend
            );
          } else {
            toast.error(payhereResponse.data.message || "Failed to create order");
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-8 min-h-[80vh] px-4"
    >
      {/* ---------- Left Side (Delivery Information) ---------- */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <input
              required
              onChange={onChangeHandler}
              name="firstName"
              value={formData.firstName}
              className={`border p-2 rounded w-full ${errors.firstName ? "border-red-500" : ""}`}
              type="text"
              placeholder="First name"
            />
            {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}
          </div>
          <div>
            <input
              required
              onChange={onChangeHandler}
              name="lastName"
              value={formData.lastName}
              className={`border p-2 rounded w-full ${errors.lastName ? "border-red-500" : ""}`}
              type="text"
              placeholder="Last name"
            />
            {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}
          </div>
        </div>
        <div>
          <input
            required
            onChange={onChangeHandler}
            name="email"
            value={formData.email}
            className={`border p-2 rounded w-full ${errors.email ? "border-red-500" : ""}`}
            type="email"
            placeholder="Email address"
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
        </div>
        <div>
          <input
            required
            onChange={onChangeHandler}
            name="street"
            value={formData.street}
            className={`border p-2 rounded w-full ${errors.street ? "border-red-500" : ""}`}
            type="text"
            placeholder="Street"
          />
          {errors.street && <p className="text-red-500 text-xs">{errors.street}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <input
              required
              onChange={onChangeHandler}
              name="city"
              value={formData.city}
              className={`border p-2 rounded w-full ${errors.city ? "border-red-500" : ""}`}
              type="text"
              placeholder="City"
            />
            {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
          </div>
          <div>
            <input
              required
              onChange={onChangeHandler}
              name="state"
              value={formData.state}
              className={`border p-2 rounded w-full ${errors.state ? "border-red-500" : ""}`}
              type="text"
              placeholder="State"
            />
            {errors.state && <p className="text-red-500 text-xs">{errors.state}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <input
              required
              onChange={onChangeHandler}
              name="zipcode"
              value={formData.zipcode}
              className={`border p-2 rounded w-full ${errors.zipcode ? "border-red-500" : ""}`}
              type="text"
              placeholder="Zipcode"
            />
            {errors.zipcode && <p className="text-red-500 text-xs">{errors.zipcode}</p>}
          </div>
          <div>
            <input
              required
              onChange={onChangeHandler}
              name="country"
              value={formData.country}
              className={`border p-2 rounded w-full ${errors.country ? "border-red-500" : ""}`}
              type="text"
              placeholder="Country"
            />
            {errors.country && <p className="text-red-500 text-xs">{errors.country}</p>}
          </div>
        </div>
        <div>
          <input
            required
            onChange={onChangeHandler}
            name="phone"
            value={formData.phone}
            className={`border p-2 rounded w-full ${errors.phone ? "border-red-500" : ""}`}
            type="tel"
            placeholder="Phone"
          />
          {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
        </div>

        <div className=" hidden md:block">
          <Title text1={"PAYMENT"} text2={"METHOD"} />
          {/*----Payment Method----*/}
          <div className="flex gap-3 flex-col lg:flex-row mt-2">
            {/* PayHere Payment */}
            <div
              onClick={() => setMethod("payhere")}
              className={`flex items-center gap-3 border p-2 px-3 cursor-pointer w-full ${
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
              className={`flex items-center gap-3 border p-2 px-3 cursor-pointer w-full ${
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

          {/* ---- Place Order Button ---- */}
          <button
            type="submit"
            disabled={isSubmitting || !hasOrderItems}
            className={`w-full mt-6 ${isSubmitting ? "bg-gray-500" : "bg-black hover:bg-gray-800"} text-white py-3 rounded-md text-lg font-medium transition disabled:cursor-not-allowed disabled:bg-gray-500`}
          >
            {isSubmitting ? "Processing..." : method === "payhere" ? "Pay Now" : "Place Order"}
          </button>
        </div>
      </div>

      {/* ---------- Right Side (Cart Totals) ---------- */}

      <div className="w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl mt-3 mb-7">
          <Title text1={"CART"} text2={"ITEMS"} />
        </div>
        <div className="bg-white">
          <div className="max-h-[360px] space-y-4 overflow-y-auto pr-1">
            {orderItems.map((item) => {
              const itemPrice = Number(item.price || 0);
              const discount = Number(item.discount || 0);
              const discountedPrice = discount > 0 ? itemPrice * (1 - discount / 100) : itemPrice;
              const lineTotal = discountedPrice * Number(item.quantity || 0);

              return (
                <div
                  key={`${item._id}-${item.size}`}
                  className="flex items-start gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                >
                  <img
                    src={item.image?.[0]}
                    alt={item.name}
                    className="h-20 w-16 rounded object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800 sm:text-base">
                      {item.name}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500 sm:text-sm">
                      <span className="rounded border border-gray-200 px-2 py-0.5">
                        Size: {item.size}
                      </span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      {discount > 0 && (
                        <span className="text-gray-400 line-through">
                          {currency}
                          {itemPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="font-medium text-gray-800">
                        {currency}
                        {discountedPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right text-sm font-semibold text-gray-900">
                    {currency}
                    {lineTotal.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8">
          <CartTotal />
        </div>

        <div className="mt-4 md:hidden">
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

          {/* ---- Place Order Button ---- */}
          <button
            type="submit"
            disabled={isSubmitting || !hasOrderItems}
            className={`w-full mt-6 ${isSubmitting ? "bg-gray-500" : "bg-black hover:bg-gray-800"} text-white py-3 rounded-md text-lg font-medium transition disabled:cursor-not-allowed disabled:bg-gray-500`}
          >
            {isSubmitting ? "Processing..." : method === "payhere" ? "Pay Now" : "Place Order"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
