// src/pages/OrderDashboard.jsx
import { useEffect, useState, useCallback } from "react";
// @ts-ignore
import * as XLSX from "xlsx";
import OrderDetailModal from "../components/OrderDetailModal.jsx"; // ← import here
import "../CSS/OrderDashboard.css";

const TABS = [
  { label: "New", value: "New" },
  { label: "In Manufacturing", value: "manufacturing" },
  { label: "Ready to Move", value: "Done" },
  { label: "Finished", value: "finished" },
];

const OrderDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("New");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/Order/getAllOrders");
      const json = await res.json();
      if (res.ok) {
        console.log("📊 Frontend received orders:", json);
        console.log("📊 Sample order statusHistory:", json[0]?.statusHistory);
        setOrders(json);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Determine color class based on how long the order has been
  // in its current status, using backend-provided statusHistory dates.
  const getStatusColor = (order) => {
    if (!order) return "";
    const status = order.status;
    const hist = Array.isArray(order.statusHistory) ? order.statusHistory : [];
    const sla = order.statusSla || {};

    // Find the most recent entry for the current status
    const lastForStatus = [...hist]
      .filter((h) => h.status === status && h.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    if (!lastForStatus) return "";

    const ms = Date.now() - new Date(lastForStatus.date).getTime();
    const diffDays = Math.floor(ms / (1000 * 60 * 60 * 24));

    // pull custom thresholds if provided, else fallback to defaults
    const byStatus = sla[status] || {};
    const defaults = {
      New: { greenDays: 1, orangeDays: 3, redDays: 7 },
      manufacturing: { greenDays: 1, orangeDays: 45, redDays: 50 },
      Done: { greenDays: 1, orangeDays: 10, redDays: 15 },
    };
    const th = {
      greenDays: byStatus.greenDays ?? defaults[status]?.greenDays,
      orangeDays: byStatus.orangeDays ?? defaults[status]?.orangeDays,
      redDays: byStatus.redDays ?? defaults[status]?.redDays,
    };

    if (th.redDays != null && diffDays >= th.redDays) return "bg-red-200";
    if (th.orangeDays != null && diffDays >= th.orangeDays)
      return "bg-orange-200";
    if (th.greenDays != null && diffDays < th.greenDays) return "bg-green-200";
    return "";
  };

  // Helper function to get the date when order entered current status
  const getStatusDate = (order) => {
    console.log(
      "🔍 Getting status date for order:",
      order.orderId,
      order.status
    );
    console.log("🔍 Status history:", order.statusHistory);

    if (!order.statusHistory || order.statusHistory.length === 0) {
      console.log("⚠️ No status history, using createdAt:", order.createdAt);
      return order.createdAt; // fallback to creation date
    }

    // Find the most recent entry for the current status
    const currentStatusEntries = order.statusHistory
      .filter((entry) => entry.status === order.status)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const result =
      currentStatusEntries.length > 0
        ? currentStatusEntries[0].date
        : order.createdAt;

    console.log("✅ Status date result:", result);
    return result;
  };

  // (diff-days helper removed; using status history + SLA thresholds instead)

  // Overdue = red threshold breached according to getStatusColor
  const isOverdue = (o) => getStatusColor(o) === "bg-red-200";

  const overdueCount = orders.filter(isOverdue).length;

  // filter by tab + search
  const visible = orders
    .filter((o) => o.status === activeTab)
    .filter((o) => o.orderId.toString().includes(searchTerm.trim()));

  const exportToExcel = () => {
    const rows = visible.map((o) => ({
      "Order ID": o.orderId,
      "Created Date": new Date(o.createdAt).toISOString().split("T")[0],
      "Status Date": new Date(getStatusDate(o)).toISOString().split("T")[0],
      Status: o.status,
      Products: o.items.map((i) => i.product?.name).join(", "),
      Notes: o.notes || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, "orders.xlsx");
  };

  return (
    <div className="OrderDashboard">
      <h1>Furniture Orders Dashboard</h1>

      {overdueCount > 0 && (
        <div className="alert-banner">
          ⚠️ {overdueCount} overdue orders need attention
        </div>
      )}

      <div className="summary-cards">
        <div className="card new">
          <h3>New Orders</h3>
          <p>{orders.filter((o) => o.status === "New").length}</p>
        </div>
        <div className="card manufacturing">
          <h3>In Manufacturing</h3>
          <p>{orders.filter((o) => o.status === "manufacturing").length}</p>
        </div>
        <div className="card ready">
          <h3>Ready to Move</h3>
          <p>{orders.filter((o) => o.status === "Done").length}</p>
        </div>
      </div>

      <div className="controls-row">
        <div className="tabs">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              className={tab.value === activeTab ? "tab active" : "tab"}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="search-export">
          <input
            type="text"
            placeholder="Search by Order ID…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="export-btn" onClick={exportToExcel}>
            Export
          </button>
        </div>
      </div>

      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Created Date</th>
            <th>Status Date</th>
            <th>Status</th>
            <th>Products</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 && (
            <tr>
              <td colSpan={6} className="no-results">
                No orders to display.
              </td>
            </tr>
          )}
          {visible.map((o) => (
            <tr
              key={o._id}
              className={`${isOverdue(o) ? "overdue" : ""} ${getStatusColor(
                o
              )}`}
              onClick={() => setSelectedOrder(o)} // ← open modal on click
            >
              <td>{o.orderId}</td>
              <td>{new Date(o.createdAt).toISOString().split("T")[0]}</td>
              <td>{new Date(getStatusDate(o)).toISOString().split("T")[0]}</td>
              <td>{o.status}</td>
              <td>{o.items.map((i) => i.product?.name).join(", ")}</td>
              <td>{o.notes || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile card view */}
      <div className="orders-table-mobile">
        {visible.length === 0 && (
          <div className="no-results">No orders to display.</div>
        )}
        {visible.map((o) => (
          <div
            key={o._id}
            className={`order-card-mobile ${isOverdue(o) ? "overdue" : ""} ${getStatusColor(o)}`}
            onClick={() => setSelectedOrder(o)}
          >
            <div className="card-row">
              <span className="card-label">Order ID:</span>
              <span className="card-value">{o.orderId}</span>
            </div>
            <div className="card-row">
              <span className="card-label">Created:</span>
              <span className="card-value">{new Date(o.createdAt).toISOString().split("T")[0]}</span>
            </div>
            <div className="card-row">
              <span className="card-label">Status Date:</span>
              <span className="card-value">{new Date(getStatusDate(o)).toISOString().split("T")[0]}</span>
            </div>
            <div className="card-row">
              <span className="card-label">Status:</span>
              <span className="card-value">{o.status}</span>
            </div>
            <div className="card-row">
              <span className="card-label">Products:</span>
              <span className="card-value">{o.items.map((i) => i.product?.name).join(", ")}</span>
            </div>
            {o.notes && (
              <div className="card-row">
                <span className="card-label">Notes:</span>
                <span className="card-value">{o.notes}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          refreshList={fetchOrders} // so modal actions refresh list
        />
      )}
    </div>
  );
};

export default OrderDashboard;
