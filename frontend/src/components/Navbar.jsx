import React, { useState, useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import { googleLogout } from "@react-oauth/google";
import { FiHeart } from "react-icons/fi";

const Navbar = () => {
  const [visible, setVisible] = useState(false);

  const {
    setShowSearch,
    getCartCount,
    getWishlistCount,
    navigate,
    token,
    setToken,
    setCartItems,
    setWishlistItems,
  } = useContext(ShopContext);

  const logout = () => {
    navigate("/login");
    googleLogout();
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
    setWishlistItems({});
  };

  return (
    <div className="fixed top-0 left-0 right-0 flex items-center font-medium z-50 border-b border-gray-200 bg-white px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] h-24 ">
      <div className="relative w-full mx-auto">
        {/* Desktop Navbar */}
        <div className="hidden sm:flex items-center justify-between">
          <Link to="/">
            <img src={assets.logo} className="w-20" alt="Logo" />
          </Link>

          <ul className="flex gap-5 text-sm text-gray-700">
            <NavLink to="/" className="flex flex-col items-center gap-1">
              <p>HOME</p>
              <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
            </NavLink>
            <NavLink
              to="/collection"
              className="flex flex-col items-center gap-1"
            >
              <p>COLLECTION</p>
              <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
            </NavLink>
            <NavLink to="/about" className="flex flex-col items-center gap-1">
              <p>ABOUT</p>
              <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
            </NavLink>
            <NavLink to="/contact" className="flex flex-col items-center gap-1">
              <p>CONTACT</p>
              <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
            </NavLink>
          </ul>

          <div className="flex items-center gap-6">
            <img
              onClick={() => navigate("/collection")}
              src={assets.search_icon}
              className="w-5 cursor-pointer"
              alt="Search"
            />

            <div className="relative group">
              <img
                onClick={() => (token ? null : navigate("/login"))}
                className="w-5 cursor-pointer"
                src={assets.profile_icon}
                alt="Profile"
              />

              {token && (
                <div className="absolute right-0 top-6 z-10 hidden group-hover:block hover:block transition-all duration-150 ease-in-out">
                  <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded shadow-md">
                    <p
                      className="cursor-pointer hover:text-black"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/account");
                      }}
                    >
                      My Profile
                    </p>
                    <p
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/orders");
                      }}
                      className="cursor-pointer hover:text-black"
                    >
                      Orders
                    </p>
                    <p
                      onClick={(e) => {
                        e.stopPropagation();
                        logout();
                      }}
                      className="cursor-pointer hover:text-black"
                    >
                      Logout
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Link to="/cart" className="relative">
              <img src={assets.cart_icon} className="w-5 min-w-5" alt="Cart" />
              <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
                {getCartCount()}
              </p>
            </Link>

            <Link to="/wishlist" className="relative">
              <FiHeart className="w-5 h-5" />
              <p className="absolute right-[-6px] bottom-[-6px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
                {getWishlistCount()}
              </p>
            </Link>
          </div>
        </div>

        {/* Mobile Navbar */}
        <div className="flex sm:hidden items-center justify-between">
          <div className="flex items-center gap-5">
            <img
              onClick={() => setVisible(true)}
              src={assets.menu_icon}
              className="w-5 cursor-pointer"
              alt="Menu"
            />
            <img
              onClick={() => navigate("/collection")}
              src={assets.search_icon}
              className="w-5 cursor-pointer"
              alt="Search"
            />
          </div>

          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <img src={assets.logo} className="w-20" alt="Logo" />
          </Link>

          <div className="flex items-center gap-5">
            <Link to="/cart" className="relative">
              <img src={assets.cart_icon} className="w-5 min-w-5" alt="Cart" />
              <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
                {getCartCount()}
              </p>
            </Link>
            <Link to="/wishlist" className="relative">
              <FiHeart className="w-5 h-5" />
              <p className="absolute right-[-6px] bottom-[-6px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
                {getWishlistCount()}
              </p>
            </Link>
          </div>
        </div>

        {/* Sidebar Menu (Mobile) */}
        <div
          className={`absolute -top-4 right-0 bottom-0 bg-white transition-all duration-300 ease-in-out ${
            visible ? "w-full" : "hidden"
          }`}
        >
          <div className="flex flex-col text-gray-600 bg-white">
            <div
              onClick={() => setVisible(false)}
              className="flex items-center gap-4 py-3 cursor-pointer"
            >
              <img
                className="h-4 rotate-180"
                src={assets.dropdown_icon}
                alt=""
              />
              <p>Back</p>
            </div>
            <NavLink
              onClick={() => setVisible(false)}
              className="py-2 pl-6 border"
              to="/"
            >
              HOME
            </NavLink>
            <NavLink
              onClick={() => setVisible(false)}
              className="py-2 pl-6 border"
              to="/collection"
            >
              COLLECTION
            </NavLink>
            <NavLink
              onClick={() => setVisible(false)}
              className="py-2 pl-6 border"
              to="/about"
            >
              ABOUT
            </NavLink>
            <NavLink
              onClick={() => setVisible(false)}
              className="py-2 pl-6 border"
              to="/contact"
            >
              CONTACT
            </NavLink>
            <NavLink
              onClick={() => setVisible(false)}
              className="py-2 pl-6 border"
              to="/wishlist"
            >
              WISHLIST
            </NavLink>
            {token && (
              <NavLink
                onClick={() => setVisible(false)}
                className="py-2 pl-6 border"
                to="/account"
              >
                ACCOUNT
              </NavLink>
            )}
            <p
              onClick={() => {
                setVisible(false);
                if (token) {
                  logout();
                } else {
                  navigate("/login");
                }
              }}
              className="py-2 pl-6 border cursor-pointer"
            >
              {token ? "LOGOUT" : "LOGIN"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
