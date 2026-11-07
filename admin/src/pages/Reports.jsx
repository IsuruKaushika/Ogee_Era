import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl, currency } from "../App";

// Sri Lanka calendar date (YYYY-MM-DD) for a Date
const lkDate = (d) => new Date(d.getTime() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

const presets = () => {
  const today = lkDate(new Date());
  const month = today.slice(0, 7);
  const year = today.slice(0, 4);
  const lastMonthEnd = addDays(`${month}-01`, -1);
  return [
    { key: "today", label: "Today", from: today, to: today },
    { key: "7d", label: "Last 7 days", from: addDays(today, -6), to: today },
    { key: "30d", label: "Last 30 days", from: addDays(today, -29), to: today },
    { key: "month", label: "This month", from: `${month}-01`, to: today },
    { key: "lastmonth", label: "Last month", from: `${lastMonthEnd.slice(0, 7)}-01`, to: lastMonthEnd },
    { key: "year", label: "This year", from: `${year}-01-01`, to: today },
    { key: "all", label: "All time", from: "", to: "" },
  ];
};

const money = (n) => `${currency} ${Number(n || 0).toLocaleString("en-LK", { maximumFractionDigits: 2 })}`;

const Tile = ({ label, value, hint, tone }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className={`text-xl font-semibold mt-1 ${tone || "text-gray-900"}`}>{value}</p>
    {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
  </div>
);

const Table = ({ title, columns, rows, empty = "No data for this period" }) => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <h4 className="px-4 py-3 font-semibold text-gray-800 border-b border-gray-200">{title}</h4>
    {rows.length ? (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              {columns.map((c) => (
                <th key={c.label} className={`px-4 py-2 font-medium ${c.right ? "text-right" : "text-left"}`}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-gray-100">
                {columns.map((c) => (
                  <td key={c.label} className={`px-4 py-2 ${c.right ? "text-right" : ""}`}>{c.render(r)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="px-4 py-6 text-sm text-gray-500">{empty}</p>
    )}
  </div>
);

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const Reports = ({ token }) => {
  const list = useMemo(presets, []);
  const [preset, setPreset] = useState("30d");
  const [range, setRange] = useState(() => {
    const p = list.find((x) => x.key === "30d");
    return { from: p.from, to: p.to };
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grain, setGrain] = useState("day");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.post(backendUrl + "/api/order/report", range, { headers: { token } });
      if (res.data.success) setData(res.data);
      else toast.error(res.data.message || "Could not load the report");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [range, token]);

  useEffect(() => {
    load();
  }, [load]);

  const pick = (p) => {
    setPreset(p.key);
    setRange({ from: p.from, to: p.to });
  };
  const custom = (field, value) => {
    setPreset("custom");
    setRange((r) => ({ ...r, [field]: value }));
  };

  const series = data ? (grain === "month" ? data.byMonth : data.byDay) : [];
  const maxRevenue = Math.max(1, ...series.map((r) => r.revenue));

  const rows = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.rows;
    return data.rows.filter((r) => `${r.id} ${r.customer} ${r.phone} ${r.email} ${r.district} ${r.items} ${r.status}`.toLowerCase().includes(q));
  }, [data, search]);

  const exportCsv = () => {
    const head = ["Order ID", "Date", "Customer", "Phone", "Email", "District", "Items", "Payment method", "Paid", "Status", "Amount"];
    const lines = [head.map(csvCell).join(",")].concat(
      rows.map((r) =>
        [r.id, new Date(r.date).toLocaleString("en-LK"), r.customer, r.phone, r.email, r.district, r.items, r.method, r.paid ? "Yes" : "No", r.status, r.amount]
          .map(csvCell).join(","),
      ),
    );
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `orders-report-${range.from || "start"}-to-${range.to || "today"}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const s = data?.summary;

  return (
    <div className="container mx-auto px-4 pb-12">
      <h3 className="text-xl font-bold mb-1">Reports</h3>
      <p className="text-sm text-gray-500 mb-4">
        Income and order history. Orders are never deleted, so every past order stays here. Days follow Sri Lanka time.
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        {list.map((p) => (
          <button
            key={p.key}
            onClick={() => pick(p)}
            className={`px-3 py-1.5 rounded border text-xs font-medium ${preset === p.key ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-300 hover:bg-gray-100"}`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-6 text-sm">
        <label className="flex items-center gap-2">From
          <input type="date" value={range.from} onChange={(e) => custom("from", e.target.value)} className="border border-gray-300 rounded px-2 py-1" />
        </label>
        <label className="flex items-center gap-2">To
          <input type="date" value={range.to} onChange={(e) => custom("to", e.target.value)} className="border border-gray-300 rounded px-2 py-1" />
        </label>
        <button onClick={load} className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs font-medium">Refresh</button>
      </div>

      {loading && !data ? (
        <p className="text-gray-500">Loading report...</p>
      ) : !data ? null : (
        <div className={loading ? "opacity-60" : ""}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <Tile label="Total income" value={money(s.revenue)} hint={`${s.orders} orders, items + delivery`} />
            <Tile label="Money received" value={money(s.collected)} hint="Paid online or cash collected on delivery" tone="text-green-700" />
            <Tile label="Still to collect" value={money(s.outstanding)} hint="Cash on delivery not yet delivered" tone="text-amber-700" />
            <Tile label="Average order" value={money(s.averageOrder)} hint={`${s.customers} customers`} />
            <Tile label="Product sales" value={money(s.productSales)} hint="Items only, after discounts" />
            <Tile label="Delivery fees" value={money(s.deliveryFees)} hint="Charged to customers" />
            <Tile label="Items sold" value={s.itemsSold} />
            <Tile label="Cancelled" value={`${s.cancelledOrders} orders`} hint={`${money(s.cancelledValue)} not counted in income`} tone="text-red-700" />
          </div>
          <p className="text-xs text-gray-500 mb-6">
            Total income counts every confirmed order that is not cancelled. Unpaid card attempts are never counted.
          </p>

          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">Income over time</h4>
              <div className="flex gap-1 text-xs">
                {["day", "month"].map((g) => (
                  <button key={g} onClick={() => setGrain(g)} className={`px-2 py-1 rounded border ${grain === g ? "bg-gray-900 text-white border-gray-900" : "border-gray-300"}`}>
                    {g === "day" ? "By day" : "By month"}
                  </button>
                ))}
              </div>
            </div>
            {series.length ? (
              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                {[...series].reverse().map((r) => (
                  <div key={r.key} className="flex items-center gap-3 text-xs">
                    <span className="w-20 shrink-0 text-gray-600">{r.key}</span>
                    <div className="flex-1 bg-gray-100 rounded h-4 overflow-hidden">
                      <div className="bg-gray-800 h-full" style={{ width: `${(r.revenue / maxRevenue) * 100}%` }} />
                    </div>
                    <span className="w-28 shrink-0 text-right">{money(r.revenue)}</span>
                    <span className="w-16 shrink-0 text-right text-gray-500">{r.orders} orders</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No orders in this period</p>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mb-6">
            <Table
              title="By payment method"
              columns={[
                { label: "Method", render: (r) => (r.key === "COD" ? "Cash on delivery" : r.key === "Payhere" ? "PayHere (card)" : r.key) },
                { label: "Orders", right: true, render: (r) => r.orders },
                { label: "Income", right: true, render: (r) => money(r.revenue) },
                { label: "Received", right: true, render: (r) => money(r.collected) },
              ]}
              rows={data.byMethod}
            />
            <Table
              title="Orders by status (all, incl. cancelled)"
              columns={[
                { label: "Status", render: (r) => r.key },
                { label: "Orders", right: true, render: (r) => r.orders },
                { label: "Value", right: true, render: (r) => money(r.revenue) },
              ]}
              rows={data.byStatus}
            />
            <Table
              title="Best-selling products"
              columns={[
                { label: "Product", render: (r) => r.name },
                { label: "Sold", right: true, render: (r) => r.quantity },
                { label: "Sales", right: true, render: (r) => money(r.revenue) },
              ]}
              rows={data.topProducts}
            />
            <Table
              title="Top districts"
              columns={[
                { label: "District", render: (r) => r.key },
                { label: "Orders", right: true, render: (r) => r.orders },
                { label: "Income", right: true, render: (r) => money(r.revenue) },
              ]}
              rows={data.byDistrict}
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-gray-200">
              <h4 className="font-semibold text-gray-800">All orders in this period ({rows.length})</h4>
              <div className="flex items-center gap-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, phone, product..."
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-56"
                />
                <button onClick={exportCsv} disabled={!rows.length} className="px-3 py-1.5 rounded bg-gray-900 text-white text-xs font-medium disabled:opacity-40">
                  Download CSV
                </button>
              </div>
            </div>
            <div className="overflow-x-auto max-h-[28rem] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase sticky top-0">
                  <tr>
                    {["Date", "Customer", "Items", "Method", "Status", "Amount"].map((h) => (
                      <th key={h} className={`px-4 py-2 font-medium ${h === "Amount" ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-gray-100 align-top">
                      <td className="px-4 py-2 whitespace-nowrap">{new Date(r.date).toLocaleDateString("en-LK")}</td>
                      <td className="px-4 py-2">{r.customer}<br /><span className="text-xs text-gray-500">{r.phone}</span></td>
                      <td className="px-4 py-2 text-xs max-w-xs">{r.items}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{r.method === "COD" ? "COD" : "Card"} {r.paid ? "(paid)" : "(unpaid)"}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{r.status}</td>
                      <td className={`px-4 py-2 text-right whitespace-nowrap ${r.status === "Cancelled" ? "line-through text-gray-400" : ""}`}>{money(r.amount)}</td>
                    </tr>
                  ))}
                  {!rows.length && (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">No orders found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
