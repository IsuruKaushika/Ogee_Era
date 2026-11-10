import React from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import Add from "./pages/Add";
import List from "./pages/List";
import PlacedOrders from "./pages/PlacedOrders";
import PackingOrders from "./pages/PackingOrders";
import DeliveredOrders from "./pages/DeliveredOrders";
import Edit from "./pages/Edit";
import Home from "./pages/Home";
import Customers from "./pages/Customers";
import Transactions from "./pages/Transactions";
import Reviews from "./pages/Reviews";
import Promotions from "./pages/Promotions";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";

import Login from "./components/Login";
import { useState, useEffect } from "react";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = "Rs";

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : "",
  );

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

  return (
    <div className="bg-[#f5f6f8] min-h-screen text-slate-600">
      <ToastContainer position="top-right" />
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} onMenu={() => setMenuOpen(true)} />
          <div className="flex w-full">
            <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
            <main className="flex-1 min-w-0 px-3 sm:px-6 lg:px-8 py-6 text-[15px]">
              <div className="max-w-[1280px] mx-auto">
              <Routes>
                <Route path="/" element={<Home token={token} />} />
                <Route path="/overview" element={<Home token={token} />} />
                <Route path="/add" element={<Add token={token} />} />
                <Route path="/list" element={<List token={token} />} />
                <Route
                  path="/Placedorders"
                  element={<PlacedOrders token={token} />}
                />
                <Route
                  path="/PackingOrders"
                  element={<PackingOrders token={token} />}
                />
                <Route
                  path="/DeliveredOrders"
                  element={<DeliveredOrders token={token} />}
                />
                <Route
                  path="/transactions"
                  element={<Transactions token={token} />}
                />
                <Route
                  path="/customers"
                  element={<Customers token={token} />}
                />
                <Route path="/reports" element={<Reports token={token} />} />
                <Route path="/reviews" element={<Reviews token={token} />} />
                <Route path="/promotions" element={<Promotions token={token} />} />
                <Route path="/settings" element={<Settings token={token} />} />
                <Route path="/edit/:id" element={<Edit token={token} />} />
              </Routes>
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
