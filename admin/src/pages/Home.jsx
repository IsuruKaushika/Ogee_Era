import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const statusColorMap = {
  "Order Placed": "bg-blue-500",
  Packing: "bg-amber-500",
  Delivered: "bg-emerald-500",
  Failed: "bg-red-500",
  "Pending Payment": "bg-slate-500",
};

const stockColorMap = {
  "In Stock": "#10b981",
  "Limited Stock": "#f59e0b",
  "Out of Stock": "#ef4444",
};

const formatMonth = (date) =>
  date.toLocaleString("en-US", { month: "short", year: "2-digit" });

const StatCard = ({ title, value, note }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    <p className="text-xs uppercase tracking-wide text-gray-500">{title}</p>
    <p className="mt-2 text-2xl font-semibold text-gray-800">{value}</p>
    <p className="mt-1 text-xs text-gray-500">{note}</p>
  </div>
);

const SalesLineChart = ({ points }) => {
  if (!points || points.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-sky-50/60 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">
            Sales Trend (Last 6 Months)
          </p>
          <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-sky-700">
            Revenue
          </span>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          No sales data available yet.
        </p>
      </div>
    );
  }

  const width = 720;
  const height = 240;
  const padding = 30;
  const maxValue = Math.max(...points.map((p) => p.total), 1);
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const coords = points.map((point, index) => {
    const x = padding + (index * chartW) / Math.max(points.length - 1, 1);
    const y = padding + chartH - (point.total / maxValue) * chartH;
    return { ...point, x, y };
  });

  const polyline = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const linePath = coords.reduce(
    (path, point, index) =>
      index === 0
        ? `M ${point.x} ${point.y}`
        : `${path} L ${point.x} ${point.y}`,
    "",
  );
  const areaPath = linePath
    ? `${linePath} L ${coords[coords.length - 1].x} ${height - padding} L ${coords[0].x} ${height - padding} Z`
    : "";

  const yGuides = [0.25, 0.5, 0.75].map((ratio) => ({
    y: padding + chartH * ratio,
    value: Math.round(maxValue * (1 - ratio)),
  }));

  return (
    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-sky-50/60 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">
          Sales Trend (Last 6 Months)
        </p>
        <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-sky-700">
          Revenue
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 w-full">
        <defs>
          <linearGradient id="salesAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="salesLineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <filter
            id="salesLineGlow"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {yGuides.map((guide) => (
          <g key={guide.y}>
            <line
              x1={padding}
              y1={guide.y}
              x2={width - padding}
              y2={guide.y}
              stroke="#e2e8f0"
              strokeDasharray="5 7"
            />
            <text x={4} y={guide.y + 4} fontSize="10" fill="#94a3b8">
              {currency} {guide.value.toLocaleString()}
            </text>
          </g>
        ))}

        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#cbd5e1"
        />

        {areaPath && <path d={areaPath} fill="url(#salesAreaGradient)" />}
        <polyline
          fill="none"
          stroke="url(#salesLineGradient)"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={polyline}
          filter="url(#salesLineGlow)"
        />
        {coords.map((c) => (
          <g key={c.label}>
            <circle cx={c.x} cy={c.y} r="6" fill="#2563eb" opacity="0.16" />
            <circle
              cx={c.x}
              cy={c.y}
              r="3.4"
              fill="#ffffff"
              stroke="#2563eb"
              strokeWidth="2"
            />
            <text
              x={c.x}
              y={height - 8}
              textAnchor="middle"
              fontSize="10"
              fill="#64748b"
            >
              {c.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

const StockPieChart = ({ breakdown }) => {
  const entries = Object.entries(breakdown);
  const total = entries.reduce((sum, [, value]) => sum + value, 0) || 1;
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-gray-700">Stock Distribution</p>
      <div className="mt-4 flex items-center gap-5">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <g transform="translate(80,80) rotate(-90)">
            {entries.map(([key, value]) => {
              const fraction = value / total;
              const dash = fraction * circumference;
              const offset = -cumulative * circumference;
              cumulative += fraction;

              return (
                <circle
                  key={key}
                  r={radius}
                  cx="0"
                  cy="0"
                  fill="transparent"
                  stroke={stockColorMap[key]}
                  strokeWidth="20"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={offset}
                />
              );
            })}
          </g>
        </svg>
        <div className="space-y-2 text-sm">
          {entries.map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: stockColorMap[key] }}
              />
              <span className="text-gray-700">{key}</span>
              <span className="font-semibold text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Home = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;

      setLoading(true);
      try {
        const [ordersRes, productsRes] = await Promise.all([
          axios.post(
            backendUrl + "/api/order/list",
            {},
            { headers: { token } },
          ),
          axios.get(backendUrl + "/api/product/list"),
        ]);

        if (ordersRes.data.success) {
          setOrders(ordersRes.data.orders || []);
        } else {
          toast.error(ordersRes.data.message || "Failed to load orders");
        }

        if (productsRes.data.success) {
          setProducts(productsRes.data.products || []);
        } else {
          toast.error(productsRes.data.message || "Failed to load products");
        }
      } catch (error) {
        toast.error(error.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const analytics = useMemo(() => {
    const validOrders = orders.filter(
      (order) =>
        order.status !== "Failed" && order.status !== "Pending Payment",
    );

    const totalSales = validOrders.reduce(
      (sum, order) => sum + Number(order.amount || 0),
      0,
    );
    const deliveredOrders = validOrders.filter(
      (order) => order.status === "Delivered",
    );
    const currentMonth = new Date();
    const monthlySales = validOrders
      .filter((order) => {
        const d = new Date(order.date);
        return (
          d.getMonth() === currentMonth.getMonth() &&
          d.getFullYear() === currentMonth.getFullYear()
        );
      })
      .reduce((sum, order) => sum + Number(order.amount || 0), 0);

    const latestTransactions = [...validOrders]
      .sort((a, b) => b.date - a.date)
      .slice(0, 6);

    const productSalesMap = {};
    validOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const key = item._id || item.id || item.productId || item.name;
        if (!key) return;

        if (!productSalesMap[key]) {
          productSalesMap[key] = {
            name: item.name || "Unnamed",
            quantity: 0,
            revenue: 0,
          };
        }
        const quantity = Number(item.quantity || 0);
        const price = Number(item.price || 0);
        productSalesMap[key].quantity += quantity;
        productSalesMap[key].revenue += quantity * price;
      });
    });

    const trendingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const stockBreakdown = {
      "In Stock": 0,
      "Limited Stock": 0,
      "Out of Stock": 0,
    };
    products.forEach((product) => {
      const status = product.stockStatus || "In Stock";
      if (stockBreakdown[status] !== undefined) stockBreakdown[status] += 1;
    });

    const lowStockProducts = products
      .filter(
        (p) =>
          p.stockStatus === "Out of Stock" || p.stockStatus === "Limited Stock",
      )
      .slice(0, 6);

    const statusSummary = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const monthData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      monthData.push({
        month: d.getMonth(),
        year: d.getFullYear(),
        label: formatMonth(d),
        total: 0,
      });
    }

    validOrders.forEach((order) => {
      const d = new Date(order.date);
      const slot = monthData.find(
        (m) => m.month === d.getMonth() && m.year === d.getFullYear(),
      );
      if (slot) slot.total += Number(order.amount || 0);
    });

    return {
      totalSales,
      monthlySales,
      deliveredCount: deliveredOrders.length,
      totalOrders: orders.length,
      latestTransactions,
      trendingProducts,
      stockBreakdown,
      lowStockProducts,
      statusSummary,
      monthData,
    };
  }, [orders, products]);

  if (loading) {
    return <p className="text-gray-500">Loading dashboard...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admin Overview</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Sales"
          value={`${currency} ${analytics.totalSales.toLocaleString()}`}
          note="All successful orders"
        />
        <StatCard
          title="Sales This Month"
          value={`${currency} ${analytics.monthlySales.toLocaleString()}`}
          note="Current calendar month"
        />
        <StatCard
          title="Total Orders"
          value={analytics.totalOrders}
          note="All order statuses"
        />
        <StatCard
          title="Delivered Orders"
          value={analytics.deliveredCount}
          note="Completed deliveries"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SalesLineChart
          points={analytics.monthData.map((m) => ({
            label: m.label,
            total: m.total,
          }))}
        />
        <StockPieChart breakdown={analytics.stockBreakdown} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-700">
            Latest Transactions
          </p>
          <div className="mt-3 space-y-3">
            {analytics.latestTransactions.length ? (
              analytics.latestTransactions.map((order) => (
                <div
                  key={order._id}
                  className="rounded-md border border-gray-100 p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-800">
                      {(order.address?.firstName || "") +
                        " " +
                        (order.address?.lastName || "")}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {currency} {Number(order.amount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(order.date).toLocaleString()}</span>
                    <span
                      className={`rounded px-2 py-0.5 text-white ${statusColorMap[order.status] || "bg-gray-500"}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No transactions available.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-700">
            Trending Products
          </p>
          <div className="mt-3 space-y-3">
            {analytics.trendingProducts.length ? (
              analytics.trendingProducts.map((product) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between rounded-md border border-gray-100 p-3 text-sm"
                >
                  <p className="font-medium text-gray-800">{product.name}</p>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {product.quantity} sold
                    </p>
                    <p className="text-xs text-gray-500">
                      {currency} {product.revenue.toLocaleString()} revenue
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No trend data yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-700">Stock Alerts</p>
          <div className="mt-3 space-y-2 text-sm">
            {analytics.lowStockProducts.length ? (
              analytics.lowStockProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2"
                >
                  <span>{product.name}</span>
                  <span
                    className="rounded px-2 py-0.5 text-white"
                    style={{
                      backgroundColor:
                        stockColorMap[product.stockStatus] || "#6b7280",
                    }}
                  >
                    {product.stockStatus}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">All products are in stock.</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-700">
            Order Status Split
          </p>
          <div className="mt-3 space-y-3">
            {Object.keys(analytics.statusSummary).length ? (
              Object.entries(analytics.statusSummary).map(([status, count]) => {
                const percent = Math.round(
                  (count / Math.max(analytics.totalOrders, 1)) * 100,
                );
                return (
                  <div key={status}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-gray-700">{status}</span>
                      <span className="font-medium text-gray-900">
                        {count} ({percent}%)
                      </span>
                    </div>
                    <div className="h-2 rounded bg-gray-100">
                      <div
                        className={`h-2 rounded ${statusColorMap[status] || "bg-gray-500"}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500">No orders yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
