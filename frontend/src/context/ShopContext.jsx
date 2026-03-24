import { createContext, useEffect } from "react";
import { useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();
const ShopContextProvider = (props) => {
  const GUEST_CART_KEY = "guestCart";
  const GUEST_WISHLIST_KEY = "guestWishlist";
  const currency = "Rs.";
  const delivery_fee = 400;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [wishlistItems, setWishlistItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Select Product Size");
      return;
    }

    let cartData = structuredClone(cartItems);
    let isFirstTime = false;

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
        isFirstTime = true;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
      isFirstTime = true;
    }
    setCartItems(cartData);

    if (isFirstTime) {
      toast.success("Item added to cart", {
        position: "top-center",
        autoClose: 2000,
      });
    }

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/add",
          { itemId, size },
          { headers: { token } },
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
    return totalCount;
  };

  const getWishlistCount = () => Object.keys(wishlistItems || {}).length;

  const isInWishlist = (itemId) => Boolean(wishlistItems?.[itemId]);

  const getCartDiscount = () => {
    let totalDiscount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0 && itemInfo.discount) {
            const discountAmount =
              ((itemInfo.price * itemInfo.discount) / 100) *
              cartItems[items][item];
            totalDiscount += discountAmount;
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
    return totalDiscount.toFixed(2);
  };

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/update",
          { itemId, size, quantity },
          { headers: { token } },
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
    return totalAmount.toFixed(2);
  };

  const getProductsData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getUserCart = async (token) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/cart/get",
        {},
        { headers: { token } },
      );
      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getUserWishlist = async (token) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/user/wishlist/get",
        {},
        { headers: { token } },
      );

      if (response.data.success) {
        setWishlistItems(response.data.wishlistData || {});
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const addToWishlist = async (itemId) => {
    if (!token) {
      setWishlistItems((prev) => ({ ...prev, [itemId]: true }));
      toast.success("Added to wishlist", {
        position: "top-center",
        autoClose: 1600,
      });
      return;
    }

    try {
      const response = await axios.post(
        backendUrl + "/api/user/wishlist/add",
        { itemId },
        { headers: { token } },
      );

      if (response.data.success) {
        setWishlistItems(response.data.wishlistData || {});
      } else {
        toast.error(response.data.message || "Failed to add wishlist item");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const removeFromWishlist = async (itemId) => {
    if (!token) {
      setWishlistItems((prev) => {
        const updated = { ...(prev || {}) };
        delete updated[itemId];
        return updated;
      });
      return;
    }

    try {
      const response = await axios.post(
        backendUrl + "/api/user/wishlist/remove",
        { itemId },
        { headers: { token } },
      );

      if (response.data.success) {
        setWishlistItems(response.data.wishlistData || {});
      } else {
        toast.error(response.data.message || "Failed to remove wishlist item");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const toggleWishlist = async (itemId) => {
    if (isInWishlist(itemId)) {
      await removeFromWishlist(itemId);
    } else {
      await addToWishlist(itemId);
    }
  };

  const mergeGuestWishlistIntoUser = async (token) => {
    try {
      const hasGuestItems = Object.keys(wishlistItems || {}).length > 0;

      if (!hasGuestItems) {
        await getUserWishlist(token);
        localStorage.removeItem(GUEST_WISHLIST_KEY);
        return;
      }

      const response = await axios.post(
        backendUrl + "/api/user/wishlist/merge",
        { guestWishlist: wishlistItems },
        { headers: { token } },
      );

      if (response.data.success) {
        setWishlistItems(response.data.wishlistData || {});
        localStorage.removeItem(GUEST_WISHLIST_KEY);
      } else {
        await getUserWishlist(token);
      }
    } catch (error) {
      console.log(error);
      await getUserWishlist(token);
    }
  };

  const mergeGuestCartIntoUser = async (token) => {
    try {
      const hasGuestItems = Object.keys(cartItems || {}).length > 0;

      if (!hasGuestItems) {
        await getUserCart(token);
        localStorage.removeItem(GUEST_CART_KEY);
        return;
      }

      const response = await axios.post(
        backendUrl + "/api/cart/merge",
        { guestCart: cartItems },
        { headers: { token } },
      );

      if (response.data.success) {
        setCartItems(response.data.cartData || {});
        localStorage.removeItem(GUEST_CART_KEY);
      } else {
        await getUserCart(token);
      }
    } catch (error) {
      console.log(error);
      await getUserCart(token);
    }
  };
  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      setToken(storedToken);
      getUserCart(storedToken);
      getUserWishlist(storedToken);
      return;
    }

    const guestCartFromStorage = localStorage.getItem(GUEST_CART_KEY);
    if (guestCartFromStorage) {
      try {
        const parsedGuestCart = JSON.parse(guestCartFromStorage);
        if (parsedGuestCart && typeof parsedGuestCart === "object") {
          setCartItems(parsedGuestCart);
        }
      } catch (error) {
        console.log(error);
        localStorage.removeItem(GUEST_CART_KEY);
      }
    }

    const guestWishlistFromStorage = localStorage.getItem(GUEST_WISHLIST_KEY);
    if (guestWishlistFromStorage) {
      try {
        const parsedGuestWishlist = JSON.parse(guestWishlistFromStorage);
        if (parsedGuestWishlist && typeof parsedGuestWishlist === "object") {
          setWishlistItems(parsedGuestWishlist);
        }
      } catch (error) {
        console.log(error);
        localStorage.removeItem(GUEST_WISHLIST_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.removeItem(GUEST_CART_KEY);
      return;
    }

    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartItems || {}));
  }, [cartItems, token]);

  useEffect(() => {
    if (token) {
      localStorage.removeItem(GUEST_WISHLIST_KEY);
      return;
    }

    localStorage.setItem(
      GUEST_WISHLIST_KEY,
      JSON.stringify(wishlistItems || {}),
    );
  }, [wishlistItems, token]);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    addToCart,
    getCartCount,
    getWishlistCount,
    isInWishlist,
    getCartDiscount,
    getUserCart,
    getUserWishlist,
    mergeGuestCartIntoUser,
    mergeGuestWishlistIntoUser,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    setToken,
    setWishlistItems,
    token,
    wishlistItems,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};
ShopContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ShopContextProvider;
