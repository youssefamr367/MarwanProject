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

  const getDiffDays = (date) => {
    const a = new Date(date),
      b = new Date();
    return Math.floor((b - a) / (1000 * 60 * 60 * 24));
  };

  const isOverdue = (o) => {
    const statusDate = getStatusDate(o);
    const d = getDiffDays(statusDate);
    if (o.status === "New") return d >= 7;
    if (o.status === "manufacturing") return d > 50;
    if (o.status === "Done") return d > 15;
    return false;
  };

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
              className={isOverdue(o) ? "overdue" : ""}
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
