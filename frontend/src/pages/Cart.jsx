import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";

import CartTotal from "../components/CartTotal";
import { toast } from "react-toastify";

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate, token } =
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

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>
      <div>
        {cartData.map((item, index) => {
          const productData = products.find(
            (product) => product._id === item._id,
          );
          if (!productData) return null;

          const discountedPrice =
            productData.discount > 0
              ? productData.price * (1 - productData.discount / 100)
              : productData.price;
          const lineTotal = discountedPrice * item.quantity;

          return (
            <div
              key={index}
              className="border-b border-gray-200 py-4 text-gray-700"
            >
              <div className=" bg-white sm:hidden">
                <div className="flex items-start gap-3">
                  <Link
                    className="cursor-pointer"
                    to={`/product/${productData._id}`}
                  >
                    <img
                      className="h-24 w-20 object-cover"
                      src={productData.image[0]}
                      alt={productData.name}
                      onClick={navigate}
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        className="cursor-pointer"
                        to={`/product/${productData._id}`}
                      >
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
                        <img className="w-4" src={assets.bin_icon} alt="" />
                      </button>
                    </div>

                    <div className="mt-2">
                      <div className="grid grid-cols-2 gap-y-2 text-xs">
                        <p className="text-gray-500">Size</p>
                        <p className="text-right font-medium text-gray-800">
                          {item.size}
                        </p>

                        <p className="text-gray-500">Unit Price</p>
                        <div className="flex items-center justify-end gap-2">
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
                        updateQuantity(
                          item._id,
                          item.size,
                          Math.max(1, item.quantity - 1),
                        )
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
                          : updateQuantity(
                              item._id,
                              item.size,
                              Number(e.target.value),
                            )
                      }
                      className="w-14 rounded-lg border border-gray-300 py-1 text-center text-sm"
                      type="number"
                      min={1}
                      value={item.quantity}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item._id, item.size, item.quantity + 1)
                      }
                      className="h-8 w-8 rounded-full bg-gray-100 text-lg leading-none"
                      aria-label={`Increase quantity of ${productData.name}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="hidden grid-cols-[4fr_2fr_0.5fr] items-center gap-4 sm:grid">
                <div className="flex items-start gap-6">
                  <Link
                    className="cursor-pointer"
                    to={`/product/${productData._id}`}
                  >
                    <img
                      className="w-16 sm:w-20"
                      src={productData.image[0]}
                      alt=""
                      onClick={navigate}
                    />
                  </Link>
                  <div>
                    <Link
                      className="cursor-pointer"
                      to={`/product/${productData._id}`}
                    >
                      <p className="text-xs sm:text-lg font-medium">
                        {productData.name}
                      </p>
                    </Link>
                    <div className="flex items center gap-5 mt-2">
                      <div className="flex items-center gap-2">
                        {productData.discount > 0 ? (
                          <>
                            <p>
                              {currency}
                              {discountedPrice.toFixed(2)}
                            </p>
                            <p className="line-through text-gray-400">
                              {currency}
                              {productData.price}
                            </p>
                          </>
                        ) : (
                          <p>
                            {currency}
                            {productData.price}
                          </p>
                        )}
                      </div>
                      <p className="px-2 sm:px-3 sm:py-1 border bg-slate">
                        {item.size}
                      </p>
                    </div>
                  </div>
                </div>
                <input
                  onChange={(e) =>
                    e.target.value === "" || e.target.value === "0"
                      ? null
                      : updateQuantity(
                          item._id,
                          item.size,
                          Number(e.target.value),
                        )
                  }
                  className="border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1"
                  type="number"
                  min={1}
                  defaultValue={item.quantity}
                />
                <img
                  onClick={() => updateQuantity(item._id, item.size, 0)}
                  className="w-4 mr-4 sm:w-5 cursor-pointer"
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
