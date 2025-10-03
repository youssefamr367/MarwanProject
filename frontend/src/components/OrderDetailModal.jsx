import { useState } from "react";
import ItemDetailModal from "./ItemDetailModal.jsx";
import "../CSS/AddOrderModal.css"; // reuse the same aom-* CSS

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
    await fetch(`/api/Order/deleteByOrderId/${order.orderId}`, { method: "DELETE" });
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

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

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
      <div className="aom-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div className="aom-modal" role="dialog" aria-modal="true" aria-labelledby="aom-title">
          {/* Header */}
          <div className="aom-header">
            <h3 id="aom-title">📦 Order #{order.orderId}</h3>
            <button type="button" className="aom-close" onClick={onClose}>×</button>
          </div>

          {/* Current Status */}
          <section className="aom-card">
            <div className="aom-field">
              <label>Current Status</label>
              <div>
                <span className={`aom-chip`}>{order.status}</span>
              </div>
            </div>
          </section>

          {/* SLA Section */}
          <section className="aom-card">
            <div className="aom-card-title">⏱ Per-Order SLA (Days)</div>
            <div className="aom-grid aom-3">
              {["New", "manufacturing", "Done"].map((st) => (
                <div key={st} className="aom-sla">
                  <div className="aom-sla-title">{st}</div>
                  <div className="aom-sla-grid">
                    <label>Green ≤</label>
                    <input
                      type="number"
                      min="0"
                      value={slaDraft[st].greenDays}
                      onChange={(e) =>
                        setSlaDraft((s) => ({ ...s, [st]: { ...s[st], greenDays: e.target.value } }))
                      }
                    />
                    <label>Orange ≤</label>
                    <input
                      type="number"
                      min="0"
                      value={slaDraft[st].orangeDays}
                      onChange={(e) =>
                        setSlaDraft((s) => ({ ...s, [st]: { ...s[st], orangeDays: e.target.value } }))
                      }
                    />
                    <label>Red ≤</label>
                    <input
                      type="number"
                      min="0"
                      value={slaDraft[st].redDays}
                      onChange={(e) =>
                        setSlaDraft((s) => ({ ...s, [st]: { ...s[st], redDays: e.target.value } }))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="aom-actions-left">
              <button type="button" className="aom-btn" onClick={saveSla}>💾 Save SLA</button>
            </div>
          </section>

          {/* Status History */}
          {order.statusHistory?.length > 0 && (
            <section className="aom-card">
              <div className="aom-card-title">📊 Status History</div>
              <div className="aom-items">
                {order.statusHistory
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((entry, index) => (
                    <div key={index} className="aom-item">
                      <div className="aom-item-main">
                        <strong>{entry.status}</strong>
                        <div className="aom-muted">{formatDate(entry.date)}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Items */}
          <section className="aom-card">
            <div className="aom-card-title">📋 Items</div>
            <ul className="aom-items">
              {order.items.map((item, idx) => (
                <li key={idx} className="aom-item">
                  <div className="aom-item-main">
                    {item.product?.name} (#{item.product?.productId})
                  </div>
                  <button
                    type="button"
                    className="aom-link"
                    onClick={() => setSelectedItem(item)}
                  >
                    View
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Footer */}
          <div className="aom-footer">
            {actions.map((a) => (
              <button
                key={a.next}
                className="aom-primary"
                onClick={() => updateStatus(a.next)}
              >
                {a.label}
              </button>
            ))}
            <button type="button" className="aom-btn" onClick={deleteOrder}>🗑️ Delete</button>
            <button type="button" className="aom-ghost" onClick={onClose}>✖️ Close</button>
          </div>
        </div>
      </div>

      {selectedItem && (
        <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </>
  );
};

export default OrderDetailModal;
