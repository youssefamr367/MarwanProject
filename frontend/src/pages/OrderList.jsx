import { useState, useEffect, useCallback } from "react";
import OrderDetailModal from "../components/OrderDetailModal.jsx";
import AddOrderModal from "../components/AddOrderModal.jsx";
import "../CSS/OrderList.css";

// show label to user, but filter by the exact status value
const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "New", value: "New" },
  { label: "In Manufacturing", value: "manufacturing" },
  { label: "Ready to Move", value: "Done" },
  { label: "Finished", value: "finished" },
];

// Determine Tailwind-like color class based on how long the order has been
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

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/Order/getAllOrders");
      const data = await res.json();
      if (res.ok) setOrders(data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // apply both filters
  const filtered = orders.filter((o) => {
    const matchesSearch = o.orderId.toString().includes(searchTerm.trim());
    const matchesStatus = statusFilter === "" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="OrderList">
      <div className="header-row">
        <h2>All Orders</h2>
        <button className="add-button" onClick={() => setShowAdd(true)}>
          + Add Order
        </button>
      </div>

      <div className="filter-row">
        <input
          type="text"
          placeholder="Search by Order ID…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-select"
        >
          {STATUS_OPTIONS.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="order-grid">
        {filtered.map((order) => (
          <div
            key={order._id}
            className={`order-card ${getStatusColor(order)}`}
            onClick={() => setSelected(order)}
          >
            <h3>Order #{order.orderId}</h3>
            <p>Status: {order.status}</p>
            <p>Items: {order.items.length}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="no-results">No orders match your criteria.</p>
        )}
      </div>

      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          refreshList={fetchOrders}
        />
      )}

      {showAdd && (
        <AddOrderModal
          onClose={() => setShowAdd(false)}
          refreshList={fetchOrders}
        />
      )}
    </div>
  );
};

export default OrderList;
