import { useState, useContext } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { googleLogout } from "@react-oauth/google";
import Logo from "./Logo";
import { FiHeart, FiSearch, FiShoppingBag, FiUser, FiMenu, FiX } from "react-icons/fi";

export const NAV_LINKS = [
  { to: "/collection", label: "New In" },
  { to: "/category/dresses", label: "Dresses" },
  { to: "/category/tops", label: "Tops" },
  { to: "/category/sarongs", label: "Lungi & Sarong" },
  { to: "/category/sarees", label: "Sarees" },
  { to: "/category/men", label: "Men" },
  { to: "/collection?offers=1", label: "Sale" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const {
    showSearch, setShowSearch, getCartCount, getWishlistCount, navigate,
    token, setToken, setCartItems, setWishlistItems,
  } = useContext(ShopContext);

  const logout = () => {
    navigate("/login");
    googleLogout();
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
    setWishlistItems({});
  };

  const Badge = ({ n }) =>
    n > 0 ? (
      <span className="absolute -right-2 -top-2 min-w-[16px] h-4 px-1 rounded-full bg-ink text-white text-[9px] leading-4 text-center">
        {n}
      </span>
    ) : null;

  return (
    <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur border-b border-stone/60">
      <div className="container-x flex items-center justify-between h-[72px] md:h-[88px]">
        <div className="flex items-center gap-4 lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open menu"><FiMenu className="w-5 h-5" /></button>
        </div>

        <Link to="/" className="flex items-center" aria-label="Home">
          <Logo className="h-14 md:h-[68px]" />
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-[13px] text-ink/85" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.label} to={l.to} className={({ isActive }) => `hover:text-ink pb-0.5 border-b ${isActive && !l.to.includes("?") ? "border-ink" : "border-transparent"}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4 md:gap-5">
          <button onClick={() => setShowSearch(!showSearch)} aria-label="Search"><FiSearch className="w-[18px] h-[18px]" /></button>
          <div className="relative group hidden sm:block">
            <button onClick={() => (token ? navigate("/account") : navigate("/login"))} aria-label="Account">
              <FiUser className="w-[18px] h-[18px]" />
            </button>
            {token && (
              <div className="absolute right-0 top-full pt-3 hidden group-hover:block z-10">
                <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-white text-sm text-ink/70 border border-stone shadow-md">
                  <button className="text-left hover:text-ink" onClick={() => navigate("/account")}>My Profile</button>
                  <button className="text-left hover:text-ink" onClick={() => navigate("/orders")}>Orders</button>
                  <button className="text-left hover:text-ink" onClick={logout}>Logout</button>
                </div>
              </div>
            )}
          </div>
          <Link to="/wishlist" className="relative hidden sm:block" aria-label="Wishlist">
            <FiHeart className="w-[18px] h-[18px]" />
            <Badge n={getWishlistCount()} />
          </Link>
          <Link to="/cart" className="relative" aria-label="Cart">
            <FiShoppingBag className="w-[18px] h-[18px]" />
            <Badge n={getCartCount()} />
          </Link>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && createPortal(
        <div className="fixed inset-0 z-[60] bg-black/40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="w-[82%] max-w-sm h-full bg-ivory p-6 flex flex-col overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <Logo className="h-12" />
              <button onClick={() => setOpen(false)} aria-label="Close menu"><FiX className="w-5 h-5" /></button>
            </div>
            <nav className="flex flex-col text-[15px]">
              {[...NAV_LINKS, { to: "/about", label: "About" }, { to: "/contact", label: "Contact" }, { to: "/wishlist", label: "Wishlist" }, { to: "/faq", label: "Help Center" }].map((l) => (
                <NavLink key={l.label} to={l.to} onClick={() => setOpen(false)} className="py-3 border-b border-stone/60">
                  {l.label}
                </NavLink>
              ))}
              {token && <NavLink to="/orders" onClick={() => setOpen(false)} className="py-3 border-b border-stone/60">My Orders</NavLink>}
              <button
                className="py-3 text-left"
                onClick={() => { setOpen(false); token ? logout() : navigate("/login"); }}
              >
                {token ? "Logout" : "Login / Register"}
              </button>
            </nav>
          </div>
        </div>,
        document.body,
      )}
    </header>
  );
};

export default Navbar;
