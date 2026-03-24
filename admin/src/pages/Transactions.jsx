import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl, currency } from "../App";
import { assets } from "../assets/assets";

const statusBadgeMap = {
  "Order Placed": "bg-blue-100 text-blue-700",
  Packing: "bg-amber-100 text-amber-700",
  Delivered: "bg-emerald-100 text-emerald-700",
  Failed: "bg-red-100 text-red-700",
  "Pending Payment": "bg-slate-100 text-slate-700",
};

const statusOptions = [
  "All Statuses",
  "Order Placed",
  "Packing",
  "Delivered",
  "Failed",
  "Pending Payment",
];

const paymentOptions = ["Yes", "No", "All Payments"];
const paymentMethodOptions = ["All Methods", "COD", "Payhere"];
const dateOptions = ["All Time", "Today", "Last 7 Days", "This Month"];

const quickFilters = [
  { key: "all", label: "All" },
  { key: "paid", label: "Paid" },
  { key: "unpaid", label: "Unpaid" },
  { key: "cod", label: "COD" },
  { key: "payhere", label: "Payhere" },
  { key: "delivered", label: "Delivered" },
  { key: "pending", label: "Pending" },
];

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const matchesDateFilter = (orderDate, dateFilter) => {
  if (dateFilter === "All Time") return true;

  const transactionDate = new Date(orderDate);
  const now = new Date();

  if (dateFilter === "Today") {
    return transactionDate >= startOfToday();
  }

  if (dateFilter === "Last 7 Days") {
    const lastWeek = new Date();
    lastWeek.setDate(now.getDate() - 7);
    return transactionDate >= lastWeek;
  }

  if (dateFilter === "This Month") {
    return (
      transactionDate.getMonth() === now.getMonth() &&
      transactionDate.getFullYear() === now.getFullYear()
    );
  }

  return true;
};

const Transactions = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [paymentFilter, setPaymentFilter] = useState("All Payments");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All Methods");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [activeQuickFilter, setActiveQuickFilter] = useState("all");

  const fetchAllTransactions = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        { headers: { token } },
      );

      if (response.data.success) {
        const sortedOrders = [...(response.data.orders || [])].sort(
          (a, b) => b.date - a.date,
        );
        setOrders(sortedOrders);
      } else {
        toast.error(response.data.message || "Failed to load transactions");
      }
    } catch (error) {
      toast.error(error.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTransactions();
  }, [token]);

  const applyQuickFilter = (filterKey) => {
    setActiveQuickFilter(filterKey);
    setStatusFilter("All Statuses");
    setPaymentFilter("All Payments");
    setPaymentMethodFilter("All Methods");

    if (filterKey === "paid") {
      setPaymentFilter("Yes");
    } else if (filterKey === "unpaid") {
      setPaymentFilter("No");
    } else if (filterKey === "cod") {
      setPaymentMethodFilter("COD");
    } else if (filterKey === "payhere") {
      setPaymentMethodFilter("Payhere");
    } else if (filterKey === "delivered") {
      setStatusFilter("Delivered");
    } else if (filterKey === "pending") {
      setStatusFilter("Pending Payment");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Statuses");
    setPaymentFilter("All Payments");
    setPaymentMethodFilter("All Methods");
    setDateFilter("All Time");
    setActiveQuickFilter("all");
  };

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "All Statuses" || order.status === statusFilter;
      const matchesPayment =
        paymentFilter === "All Payments" ||
        (paymentFilter === "Yes" ? order.payment : !order.payment);
      const matchesPaymentMethod =
        paymentMethodFilter === "All Methods" ||
        order.paymentMethod === paymentMethodFilter;
      const matchesDate = matchesDateFilter(order.date, dateFilter);

      if (
        !matchesStatus ||
        !matchesPayment ||
        !matchesPaymentMethod ||
        !matchesDate
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableParts = [
        order._id,
        order.paymentId,
        order.status,
        order.paymentMethod,
        order.address?.firstName,
        order.address?.lastName,
        order.address?.phone,
        order.address?.street,
        order.address?.city,
        order.address?.state,
        order.address?.country,
        order.address?.zipcode,
        ...(order.items || []).flatMap((item) => [item.name, item.size]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableParts.includes(normalizedSearch);
    });
  }, [
    orders,
    searchTerm,
    statusFilter,
    paymentFilter,
    paymentMethodFilter,
    dateFilter,
  ]);

  const activeFilters = [
    searchTerm ? `Search: ${searchTerm}` : null,
    statusFilter !== "All Statuses" ? `Status: ${statusFilter}` : null,
    paymentFilter !== "All Payments" ? `Payment: ${paymentFilter}` : null,
    paymentMethodFilter !== "All Methods"
      ? `Method: ${paymentMethodFilter}`
      : null,
    dateFilter !== "All Time" ? `Date: ${dateFilter}` : null,
  ].filter(Boolean);

  if (loading) {
    return <p className="text-gray-500">Loading transactions...</p>;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800">All Transactions</h3>
        </div>
        <p className="text-sm text-gray-600">
          {filteredOrders.length} transaction
          {filteredOrders.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {quickFilters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => applyQuickFilter(filter.key)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              activeQuickFilter === filter.key
                ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by customer, order ID, phone, item, or payment ID"
          className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 outline-none transition focus:border-gray-500"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 outline-none transition focus:border-gray-500"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={paymentFilter}
          onChange={(event) => setPaymentFilter(event.target.value)}
          className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 outline-none transition focus:border-gray-500"
        >
          {paymentOptions.map((payment) => (
            <option key={payment} value={payment}>
              Payment: {payment}
            </option>
          ))}
        </select>

        <select
          value={paymentMethodFilter}
          onChange={(event) => setPaymentMethodFilter(event.target.value)}
          className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 outline-none transition focus:border-gray-500"
        >
          {paymentMethodOptions.map((method) => (
            <option key={method} value={method}>
              Method: {method}
            </option>
          ))}
        </select>

        <select
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
          className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 outline-none transition focus:border-gray-500"
        >
          {dateOptions.map((dateOption) => (
            <option key={dateOption} value={dateOption}>
              Date: {dateOption}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {activeFilters.length ? (
          activeFilters.map((filter) => (
            <span
              key={filter}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
            >
              {filter}
            </span>
          ))
        ) : (
          <span className="text-sm text-gray-500">No filters applied</span>
        )}

        <button
          type="button"
          onClick={clearFilters}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50"
        >
          Clear Filters
        </button>
      </div>

      <div>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div
              className="grid grid-cols-1 gap-3 border-2 border-gray-200 p-5 text-xs text-gray-700 sm:grid-cols-[0.5fr_2fr_1fr] sm:text-sm lg:grid-cols-[0.5fr_2fr_1fr_1fr]"
              key={order._id}
            >
              <img className="w-12" src={assets.parcel_icon} alt="Parcel" />

              <div>
                <div>
                  {(order.items || []).map((item, index) => (
                    <p className="py-0.5" key={`${order._id}-${index}`}>
                      {item.name} x {item.quantity}
                      <span>{item.size ? ` (${item.size})` : ""}</span>
                    </p>
                  ))}
                </div>

                <p className="mb-2 mt-3 font-medium">
                  {(order.address?.firstName || "") +
                    " " +
                    (order.address?.lastName || "")}
                </p>

                <div>
                  <p>{order.address?.street || "No street provided"}</p>
                  <p>
                    {[
                      order.address?.city,
                      order.address?.state,
                      order.address?.country,
                      order.address?.zipcode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
                <p>{order.address?.phone || "No phone provided"}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm sm:text-[15px]">
                  Items: {(order.items || []).length}
                </p>
                <p>Method: {order.paymentMethod}</p>
                <p>Payment: {order.payment ? "Done" : "Pending"}</p>
                <p>Date: {new Date(order.date).toLocaleString()}</p>
                <p className="font-semibold">
                  {currency}
                  {Number(order.amount || 0).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                    statusBadgeMap[order.status] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {order.status}
                </span>
                <p className="text-xs text-gray-500">Order ID: {order._id}</p>
                {order.paymentId ? (
                  <p className="text-xs text-gray-500">
                    Payment ID: {order.paymentId}
                  </p>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500">
              No transactions match the current search or filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
