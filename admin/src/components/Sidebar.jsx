import React from "react";
import { NavLink } from "react-router-dom";
import { MdDashboard, MdInventory2 } from "react-icons/md";
import { IoAddCircleOutline } from "react-icons/io5";
import { FaUsers } from "react-icons/fa";
import { BsBoxSeam } from "react-icons/bs";
import { FiPackage } from "react-icons/fi";
import { TbTruckDelivery } from "react-icons/tb";

const Sidebar = () => {
  return (
    <div className="w-[18%] min-h-screen border-r-2">
      <div className="flex flex-col gap-4 pt-6 pl-[20%] text-[15px]">
        <NavLink
          className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l"
          to="/"
        >
          <MdDashboard className="w-5 h-5 text-gray-700" />
          <p className="hidden md:block">Overview</p>
        </NavLink>

        <NavLink
          className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l"
          to="/add"
        >
          <IoAddCircleOutline className="w-5 h-5 text-gray-700" />
          <p className="hidden md:block">Add Items</p>
        </NavLink>

        <NavLink
          className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l"
          to="/list"
        >
          <MdInventory2 className="w-5 h-5 text-gray-700" />
          <p className="hidden md:block">List Items</p>
        </NavLink>

        <NavLink
          className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l"
          to="/customers"
        >
          <FaUsers className="w-5 h-5 text-gray-700" />
          <p className="hidden md:block">Customers</p>
        </NavLink>

        <NavLink
          className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l"
          to="/PlacedOrders"
        >
          <BsBoxSeam className="w-5 h-5 text-gray-700" />
          <p className="hidden md:block">Placed Orders</p>
        </NavLink>

        <NavLink
          className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l"
          to="/PackingOrders"
        >
          <FiPackage className="w-5 h-5 text-gray-700" />
          <p className="hidden md:block">Packing Orders</p>
        </NavLink>

        <NavLink
          className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l"
          to="/DeliveredOrders"
        >
          <TbTruckDelivery className="w-5 h-5 text-gray-700" />
          <p className="hidden md:block">Delivered Orders</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
