import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";

import CartTotal from "../components/CartTotal";
import CartSkeleton from "../components/CartSkeleton";
import { toast } from "react-toastify";

const Cart = () => {
  const { products, isProductsLoading, currency, cartItems, updateQuantity, navigate, token } =
    useContext(ShopContext);

  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item],
            });
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, products]);

  if (isProductsLoading) {
    return <CartSkeleton />;
  }

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>
      <div>
        {cartData.length > 0 && (
          <div className="mb-2 hidden grid-cols-[minmax(0,4fr)_minmax(120px,1fr)_minmax(140px,1fr)_minmax(120px,1fr)_48px] gap-4 border-b border-gray-300 pb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 sm:grid">
            <p>Product</p>
            <p className="text-center">Price</p>
            <p className="text-center">Quantity</p>
            <p className="text-center">Subtotal</p>
            <span className="sr-only">Remove</span>
          </div>
        )}
        {cartData.map((item, index) => {
          const productData = products.find((product) => product._id === item._id);
          if (!productData) return null;

          const discountedPrice =
            productData.discount > 0
              ? productData.price * (1 - productData.discount / 100)
              : productData.price;
          const lineTotal = discountedPrice * item.quantity;

          return (
            <div key={index} className="border-b border-gray-200 py-4 text-gray-700">
              {/* Mobile Layout */}
              <div className=" bg-white md:hidden">
                <div className="flex items-start gap-3">
                  <Link className="cursor-pointer" to={`/product/${productData._id}`}>
                    <img
                      className="h-full w-20 object-cover"
                      src={productData.image[0]}
                      alt={productData.name}
                      onClick={navigate}
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link className="cursor-pointer" to={`/product/${productData._id}`}>
                        <p className="line-clamp-2 text-sm font-semibold leading-5 text-gray-900">
                          {productData.name}
                        </p>
                      </Link>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, item.size, 0)}
                        className="shrink-0 rounded-full border border-gray-300 p-2"
                        aria-label={`Remove ${productData.name} from cart`}
                      >
                        <img className="w-3" src={assets.bin_icon} alt="" />
                      </button>
                    </div>

                    <div className="">
                      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-3 py-2 text-xs">
                        <p className="text-gray-500">Size</p>
                        <p className="text-right font-medium text-gray-800">{item.size}</p>
                      </div>

                      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-3 py-2 text-xs">
                        <p className="text-gray-500">Unit Price</p>
                        <div className="flex items-center justify-end gap-2 text-right">
                          <span className="font-semibold text-gray-900">
                            {currency}
                            {discountedPrice.toFixed(2)}
                          </span>
                          {productData.discount > 0 && (
                            <span className="text-[11px] text-gray-400 line-through">
                              {currency}
                              {productData.price}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
                        <p className="text-gray-500">Subtotal</p>
                        <p className="text-right font-semibold text-gray-900">
                          {currency}
                          {lineTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Quantity
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item._id, item.size, Math.max(1, item.quantity - 1))
                      }
                      className="h-8 w-8 rounded-full bg-gray-100 text-lg leading-none"
                      aria-label={`Decrease quantity of ${productData.name}`}
                    >
                      -
                    </button>
                    <input
                      onChange={(e) =>
                        e.target.value === "" || e.target.value === "0"
                          ? null
                          : updateQuantity(item._id, item.size, Number(e.target.value))
                      }
                      className="w-14 rounded-lg border border-gray-300 py-1 text-center text-sm"
                      type="number"
                      min={1}
                      value={item.quantity}
                    />
                    <button
                      type="button"
                      onClick={() => updateQuantity(item._id, item.size, item.quantity + 1)}
                      className="h-8 w-8 rounded-full bg-gray-100 text-lg leading-none"
                      aria-label={`Increase quantity of ${productData.name}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              {/* Desktop Layout */}
              <div className="hidden grid-cols-[minmax(0,4fr)_minmax(120px,1fr)_minmax(140px,1fr)_minmax(120px,1fr)_48px] items-center gap-4 md:grid">
                <div className="flex items-start gap-6">
                  <Link className="cursor-pointer" to={`/product/${productData._id}`}>
                    <img
                      className="w-16 sm:w-20 h-full"
                      src={productData.image[0]}
                      alt=""
                      onClick={navigate}
                    />
                  </Link>
                  <div>
                    <Link className="cursor-pointer" to={`/product/${productData._id}`}>
                      <p className="text-xs sm:text-lg font-medium">{productData.name}</p>
                    </Link>
                    <div className="mt-2">
                      <p className="inline-flex border px-2 sm:px-3 sm:py-1">{item.size}</p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <p className="font-medium text-gray-900">
                      {currency}
                      {discountedPrice.toFixed(2)}
                    </p>
                    {productData.discount > 0 && (
                      <p className="text-sm text-gray-400 line-through">
                        {currency}
                        {productData.price}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item._id, item.size, Math.max(1, item.quantity - 1))
                    }
                    className="h-9 w-9 rounded-full bg-gray-100 text-lg leading-none"
                    aria-label={`Decrease quantity of ${productData.name}`}
                  >
                    -
                  </button>
                  <input
                    onChange={(e) =>
                      e.target.value === "" || e.target.value === "0"
                        ? null
                        : updateQuantity(item._id, item.size, Number(e.target.value))
                    }
                    className="w-16 rounded-lg border border-gray-300 py-1 text-center text-sm"
                    type="number"
                    min={1}
                    value={item.quantity}
                  />
                  <button
                    type="button"
                    onClick={() => updateQuantity(item._id, item.size, item.quantity + 1)}
                    className="h-9 w-9 rounded-full bg-gray-100 text-lg leading-none"
                    aria-label={`Increase quantity of ${productData.name}`}
                  >
                    +
                  </button>
                </div>
                <p className="text-center font-semibold text-gray-900">
                  {currency}
                  {lineTotal.toFixed(2)}
                </p>
                <img
                  onClick={() => updateQuantity(item._id, item.size, 0)}
                  className="mx-auto w-4 cursor-pointer sm:w-4"
                  src={assets.bin_icon}
                  alt=""
                />
              </div>
            </div>
          );
        })}
        {cartData.length === 0 && (
          <div className="text-center my-20">
            <p className="text-gray-600 mb-6">Your cart is currently empty.</p>
            <button
              onClick={() => navigate("/collection")}
              className="bg-black text-white px-6 py-3 text-sm"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        )}
      </div>
      {cartData.length > 0 && (
        <div className="flex justify-end my-20">
          <div className="w-full sm:w-[450px]">
            <CartTotal />
            <div className="w-full text-end">
              <button
                onClick={() => {
                  if (!token) {
                    toast.warn("Please login first to proceed to checkout");
                    navigate("/login");
                  } else {
                    navigate("/place-order");
                  }
                }}
                className="bg-black text-white text-sm my-8 px-6 py-3 disabled:bg-slate-500 disabled:cursor-not-allowed"
                disabled={cartData.length === 0}
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
