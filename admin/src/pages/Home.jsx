import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const statusColorMap = {
  "Order Placed": "bg-blue-500",
  Packing: "bg-amber-500",
  Delivered: "bg-emerald-500",
  Failed: "bg-red-500",
};

const stockColorMap = {
  "In Stock": "#10b981",
  "Limited Stock": "#f59e0b",
  "Out of Stock": "#ef4444",
};

const formatMonth = (date) =>
  date.toLocaleString("en-US", { month: "short", year: "2-digit" });

const formatDayShort = (date) =>
  date.toLocaleString("en-US", { weekday: "short" });

const formatDateShort = (date) =>
  date.toLocaleString("en-US", { month: "short", day: "numeric" });

const formatAxisValue = (value) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);

const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const salesRangeOptions = [
  { key: "week", label: "Week" },
  { key: "month", label: "Last Month" },
  { key: "threeMonths", label: "3 Months" },
  { key: "all", label: "All Time" },
];

const buildSalesPoints = (orders, range) => {
  const now = new Date();

  if (range === "week") {
    const points = [];
    for (let i = 6; i >= 0; i--) {
      const day = startOfDay(now);
      day.setDate(day.getDate() - i);
      points.push({
        key: day.toISOString(),
        label: formatDayShort(day),
        total: 0,
        start: day,
        end: new Date(day.getTime() + 24 * 60 * 60 * 1000),
      });
    }

    orders.forEach((order) => {
      const orderDate = new Date(order.date);
      const slot = points.find(
        (point) => orderDate >= point.start && orderDate < point.end,
      );
      if (slot) slot.total += Number(order.amount || 0);
    });

    return {
      title: "Sales Trend (Last 7 Days)",
      points: points.map(({ key, label, total }) => ({ key, label, total })),
    };
  }

  if (range === "month") {
    const points = [];
    for (let i = 4; i >= 0; i--) {
      const end = startOfDay(now);
      end.setDate(end.getDate() - i * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);

      points.push({
        key: start.toISOString(),
        label: `${formatDateShort(start)}-${formatDateShort(end)}`,
        total: 0,
        start,
        end: new Date(end.getTime() + 24 * 60 * 60 * 1000),
      });
    }

    orders.forEach((order) => {
      const orderDate = new Date(order.date);
      const slot = points.find(
        (point) => orderDate >= point.start && orderDate < point.end,
      );
      if (slot) slot.total += Number(order.amount || 0);
    });

    return {
      title: "Sales Trend (Last Month)",
      points: points.map(({ key, label, total }) => ({ key, label, total })),
    };
  }

  if (range === "threeMonths") {
    const points = [];
    for (let i = 2; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      points.push({
        key: monthDate.toISOString(),
        label: formatMonth(monthDate),
        total: 0,
        month: monthDate.getMonth(),
        year: monthDate.getFullYear(),
      });
    }

    orders.forEach((order) => {
      const orderDate = new Date(order.date);
      const slot = points.find(
        (point) =>
          point.month === orderDate.getMonth() &&
          point.year === orderDate.getFullYear(),
      );
      if (slot) slot.total += Number(order.amount || 0);
    });

    return {
      title: "Sales Trend (Last 3 Months)",
      points: points.map(({ key, label, total }) => ({ key, label, total })),
    };
  }

  const monthMap = new Map();
  orders
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((order) => {
      const orderDate = new Date(order.date);
      const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;

      if (!monthMap.has(monthKey)) {
        const monthDate = new Date(
          orderDate.getFullYear(),
          orderDate.getMonth(),
          1,
        );
        monthMap.set(monthKey, {
          key: monthDate.toISOString(),
          label: formatMonth(monthDate),
          total: 0,
        });
      }

      monthMap.get(monthKey).total += Number(order.amount || 0);
    });

  return {
    title: "Sales Trend (All Time)",
    points: Array.from(monthMap.values()),
  };
};

const buildSmoothLinePath = (coords) => {
  if (!coords.length) return "";
  if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;

  return coords.reduce((path, point, index, array) => {
    if (index === 0) return `M ${point.x} ${point.y}`;

    const previous = array[index - 1];
    const controlX = (previous.x + point.x) / 2;
    return `${path} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
};

const StatCard = ({ title, value, note }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    <p className="text-xs uppercase tracking-wide text-gray-500">{title}</p>
    <p className="mt-2 text-2xl font-semibold text-gray-800">{value}</p>
    <p className="mt-1 text-xs text-gray-500">{note}</p>
  </div>
);

const SalesLineChart = ({ title, points, range, onRangeChange }) => {
  if (!points || points.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-sky-50/60 p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-700">{title}</p>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Range
            <select
              value={range}
              onChange={(event) => onRangeChange(event.target.value)}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold normal-case text-gray-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              aria-label="Select sales chart range"
            >
              {salesRangeOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          No sales data available yet.
        </p>
      </div>
    );
  }

  const width = 720;
  const height = 240;
  const paddingTop = 24;
  const paddingRight = 18;
  const paddingBottom = 30;
  const paddingLeft = 72;
  const maxValue = Math.max(...points.map((p) => p.total), 1);
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;
  const labelStep = points.length > 10 ? Math.ceil(points.length / 6) : 1;

  const coords = points.map((point, index) => {
    const x =
      paddingLeft + (index * chartW) / Math.max(points.length - 1, 1);
    const y = paddingTop + chartH - (point.total / maxValue) * chartH;
    return { ...point, x, y };
  });

  const linePath = buildSmoothLinePath(coords);
  const areaPath = linePath
    ? `${linePath} L ${coords[coords.length - 1].x} ${height - paddingBottom} L ${coords[0].x} ${height - paddingBottom} Z`
    : "";

  const yGuides = [1, 0.75, 0.5, 0.25, 0].map((ratio) => ({
    y: paddingTop + chartH * (1 - ratio),
    value: Math.round(maxValue * ratio),
  }));

  return (
    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-sky-50/60 p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-gray-700">{title}</p>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Range
          <select
            value={range}
            onChange={(event) => onRangeChange(event.target.value)}
            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold normal-case text-gray-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            aria-label="Select sales chart range"
          >
            {salesRangeOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
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
              x1={paddingLeft}
              y1={guide.y}
              x2={width - paddingRight}
              y2={guide.y}
              stroke="#e2e8f0"
              strokeDasharray="5 7"
            />
            <text
              x={paddingLeft - 10}
              y={guide.y + 4}
              textAnchor="end"
              fontSize="10"
              fill="#94a3b8"
            >
              {currency} {formatAxisValue(guide.value)}
            </text>
          </g>
        ))}

        <line
          x1={paddingLeft}
          y1={height - paddingBottom}
          x2={width - paddingRight}
          y2={height - paddingBottom}
          stroke="#cbd5e1"
        />

        {areaPath && <path d={areaPath} fill="url(#salesAreaGradient)" />}
        <path
          d={linePath}
          fill="none"
          stroke="url(#salesLineGradient)"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          filter="url(#salesLineGlow)"
        />
        {coords.map((c, index) => (
          <g key={c.key || c.label}>
            <circle cx={c.x} cy={c.y} r="6" fill="#2563eb" opacity="0.16" />
            <circle
              cx={c.x}
              cy={c.y}
              r="3.4"
              fill="#ffffff"
              stroke="#2563eb"
              strokeWidth="2"
            />
            {(coords.length <= 10 ||
              index % labelStep === 0 ||
              index === coords.length - 1) && (
              <text
                x={c.x}
                y={height - 8}
                textAnchor="middle"
                fontSize="10"
                fill="#64748b"
              >
                {c.label}
              </text>
            )}
          </g>
        ))}
        </svg>
      </div>
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
      <div className="mt-4 flex min-h-[180px] items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-5 sm:flex-row sm:items-center">
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
    </div>
  );
};

const Home = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salesRange, setSalesRange] = useState("week");

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
    const totalOrders = orders.filter(
      (order) =>
        order.paymentMethod === "COD" ||
        (order.paymentMethod === "Payhere" && order.payment),
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

    const statusSummary = orders
      .filter((order) => order.status !== "Pending Payment")
      .reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalSales,
      monthlySales,
      deliveredCount: deliveredOrders.length,
      totalOrders: totalOrders.length,
      latestTransactions,
      trendingProducts,
      stockBreakdown,
      lowStockProducts,
      statusSummary,
      salesChart: buildSalesPoints(validOrders, salesRange),
    };
  }, [orders, products, salesRange]);

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
          note="Paid + COD"
        />
        <StatCard
          title="Delivered Orders"
          value={analytics.deliveredCount}
          note="Completed deliveries"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SalesLineChart
          title={analytics.salesChart.title}
          subtitle={analytics.salesChart.subtitle}
          points={analytics.salesChart.points}
          range={salesRange}
          onRangeChange={setSalesRange}
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
