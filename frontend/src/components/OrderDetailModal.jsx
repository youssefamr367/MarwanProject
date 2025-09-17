import { useState } from "react";
import ItemDetailModal from "./ItemDetailModal.jsx";
import "../CSS/OrderDetailModal.css";

const OrderDetailModal = ({ order, onClose, refreshList }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [slaDraft, setSlaDraft] = useState(() => {
    const base = order.statusSla || {};
    const ensure = (s) => ({
      greenDays: base[s]?.greenDays ?? "",
      orangeDays: base[s]?.orangeDays ?? "",
      redDays: base[s]?.redDays ?? "",
    });
    return {
      New: ensure("New"),
      manufacturing: ensure("manufacturing"),
      Done: ensure("Done"),
    };
  });

  const updateStatus = async (newStatus) => {
    await fetch(`/api/Order/updateByProductId/${order.orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    refreshList();
    onClose();
  };

  const deleteOrder = async () => {
    if (!window.confirm("Delete this order?")) return;
    await fetch(`/api/Order/deleteByOrderId/${order.orderId}`, {
      method: "DELETE",
    });
    refreshList();
    onClose();
  };

  const normalizeSla = (raw) => {
    const out = {};
    for (const key of ["New", "manufacturing", "Done"]) {
      const g = raw[key]?.greenDays;
      const o = raw[key]?.orangeDays;
      const r = raw[key]?.redDays;
      const hasAny = g !== "" || o !== "" || r !== "";
      if (hasAny) {
        out[key] = {};
        if (g !== "") out[key].greenDays = Number(g);
        if (o !== "") out[key].orangeDays = Number(o);
        if (r !== "") out[key].redDays = Number(r);
      }
    }
    return Object.keys(out).length ? out : undefined;
  };

  const saveSla = async () => {
    await fetch(`/api/Order/updateByProductId/${order.orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statusSla: normalizeSla(slaDraft) }),
    });
    await refreshList();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const actions = [];
  if (order.status === "New") {
    actions.push({ label: "Move to Manufacturing", next: "manufacturing" });
  } else if (order.status === "manufacturing") {
    actions.push({ label: "Back to New", next: "New" });
    actions.push({ label: "Move to Ready", next: "Done" });
  } else if (order.status === "Done") {
    actions.push({ label: "Back to Manufacturing", next: "manufacturing" });
    actions.push({ label: "Mark as Finished", next: "finished" });
  } else if (order.status === "finished") {
    actions.push({ label: "Back to Ready", next: "Done" });
  }

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <h3>📦 Order #{order.orderId}</h3>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>

          {/* Status */}
          <p>
            <strong>Current Status: </strong>
            <span className={`status-badge ${order.status.toLowerCase()}`}>
              {order.status}
            </span>
          </p>

          {/* SLA Section */}
          <div className="section-card">
            <div className="section-title-row">
              <h4>⏱ Per-Order SLA (Days)</h4>
              <button className="small-btn" onClick={saveSla}>💾 Save SLA</button>
            </div>
            <div className="sla-grid">
              {["New", "manufacturing", "Done"].map((st) => (
                <div key={st} className="sla-card">
                  <div className="sla-title">{st}</div>
                  <div className="sla-fields">
                    <label>Green ≤</label>
                    <input
                      type="number"
                      min="0"
                      value={slaDraft[st].greenDays}
                      onChange={(e) =>
                        setSlaDraft((s) => ({
                          ...s,
                          [st]: { ...s[st], greenDays: e.target.value },
                        }))
                      }
                    />
                    <label>Orange ≤</label>
                    <input
                      type="number"
                      min="0"
                      value={slaDraft[st].orangeDays}
                      onChange={(e) =>
                        setSlaDraft((s) => ({
                          ...s,
                          [st]: { ...s[st], orangeDays: e.target.value },
                        }))
                      }
                    />
                    <label>Red ≤</label>
                    <input
                      type="number"
                      min="0"
                      value={slaDraft[st].redDays}
                      onChange={(e) =>
                        setSlaDraft((s) => ({
                          ...s,
                          [st]: { ...s[st], redDays: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status History */}
          {order.statusHistory?.length > 0 && (
            <div className="status-history">
              <h4>📊 Status History</h4>
              <div className="status-timeline">
                {order.statusHistory
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((entry, index) => (
                    <div
                      key={index}
                      className={`status-entry ${
                        entry.status === order.status ? "current" : ""
                      }`}
                      data-status={entry.status}
                    >
                      <div className="status-name">{entry.status}</div>
                      <div className="status-date">{formatDate(entry.date)}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="section-card">
            <h4>📋 Items</h4>
            <ul className="product-list">
              {order.items.map((item, idx) => (
                <li key={idx}>
                  <button
                    className="link-button"
                    onClick={() => setSelectedItem(item)}
                  >
                    {item.product?.name} (#{item.product?.productId})
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer Buttons */}
          <div className="modal-buttons">
            {actions.map((a) => (
              <button
                key={a.next}
                className="action-btn"
                onClick={() => updateStatus(a.next)}
              >
                {a.label}
              </button>
            ))}

            <button className="action-btn delete-btn" onClick={deleteOrder}>
              🗑️ Delete
            </button>

            <button onClick={onClose}>✖️ Close</button>
          </div>
        </div>
      </div>

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
};

export default OrderDetailModal;
