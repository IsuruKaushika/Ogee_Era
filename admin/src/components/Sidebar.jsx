import React from "react";
import { NavLink } from "react-router-dom";
import { MdDashboard, MdInventory2 } from "react-icons/md";
import { IoAddCircleOutline } from "react-icons/io5";
import { FaUsers } from "react-icons/fa";
import { BsBoxSeam } from "react-icons/bs";
import { FiPackage, FiStar, FiImage, FiSettings, FiBarChart2, FiX } from "react-icons/fi";
import { TbTruckDelivery } from "react-icons/tb";
import { HiOutlineCreditCard } from "react-icons/hi";

const GROUPS = [
  {
    title: "Dashboard",
    items: [
      { to: "/", label: "Overview", icon: MdDashboard, end: true },
      { to: "/reports", label: "Reports", icon: FiBarChart2 },
    ],
  },
  {
    title: "Orders",
    items: [
      { to: "/PlacedOrders", label: "Placed Orders", icon: BsBoxSeam },
      { to: "/PackingOrders", label: "Packing Orders", icon: FiPackage },
      { to: "/DeliveredOrders", label: "Delivered Orders", icon: TbTruckDelivery },
      { to: "/transactions", label: "Transactions", icon: HiOutlineCreditCard },
    ],
  },
  {
    title: "Products",
    items: [
      { to: "/add", label: "Add Items", icon: IoAddCircleOutline },
      { to: "/list", label: "List Items", icon: MdInventory2 },
    ],
  },
  {
    title: "Customers",
    items: [
      { to: "/customers", label: "Customers", icon: FaUsers },
      { to: "/reviews", label: "Reviews", icon: FiStar },
    ],
  },
  {
    title: "Storefront",
    items: [
      { to: "/promotions", label: "Promotions", icon: FiImage },
      { to: "/settings", label: "Site Settings", icon: FiSettings },
    ],
  },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
    isActive ? "bg-slate-800 text-white font-medium shadow-sm" : "text-slate-600 hover:bg-slate-100"
  }`;

// Fixed menu on large screens, slide-in drawer on phones and tablets
const Sidebar = ({ open, onClose }) => {
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={`fixed z-50 top-0 left-0 h-full w-64 bg-white border-r border-slate-200 overflow-y-auto transition-transform duration-200
          lg:sticky lg:top-14 lg:z-10 lg:h-[calc(100vh-3.5rem)] lg:translate-x-0 lg:shrink-0
          ${open ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Admin menu"
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-slate-100 lg:hidden">
          <span className="font-semibold text-slate-800">Menu</span>
          <button onClick={onClose} aria-label="Close menu" className="p-2 -mr-2 text-slate-500">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-3 pb-10 space-y-5">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{g.title}</p>
              <div className="space-y-0.5">
                {g.items.map(({ to, label, icon: Icon, end }) => (
                  <NavLink key={to} to={to} end={end} onClick={onClose} className={linkClass}>
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
