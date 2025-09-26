import { useState, useEffect } from "react";
import "../CSS/AddOrderModal.css";
import React from "react";

const AddOrderModal = ({ onClose, refreshList }) => {
  const [orderId, setOrderId] = useState("");
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [itemDraft, setItemDraft] = useState({
    productId: "",
    fabrics: [],
    eshra: [],
    paintings: [],
    marble: [],
    dehnat: [],
    supplierId: "",
  });
  const [items, setItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [statusSla, setStatusSla] = useState({
    New: { greenDays: "", orangeDays: "", redDays: "" },
    manufacturing: { greenDays: "", orangeDays: "", redDays: "" },
    Done: { greenDays: "", orangeDays: "", redDays: "" },
  });

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

  useEffect(() => {
    fetch("/api/Product/getAllProduct")
      .then((r) => r.json())
      .then(setProducts);
    fetch("/api/suppliers/all")
      .then((r) => r.json())
      .then(setSuppliers);
  }, []);

  const selProd = products.find(
    (p) => p.productId.toString() === itemDraft.productId
  );

  const handleProductChange = (e) => {
    setItemDraft({
      productId: e.target.value,
      fabrics: [],
      eshra: [],
      paintings: [],
      marble: [],
      dehnat: [],
      supplierId: "",
    });
  };

  const handleMultiSelectChange = (field, e) => {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    setItemDraft((d) => ({ ...d, [field]: selected }));
  };

  const addItem = () => {
    const { productId, fabrics, supplierId } = itemDraft;
    if (!productId || fabrics.length === 0 || !supplierId) {
      return alert(
        "Product, at least one fabric, and a supplier are required."
      );
    }
    setItems((i) => [...i, itemDraft]);
    setItemDraft({
      productId: "",
      fabrics: [],
      eshra: [],
      paintings: [],
      marble: [],
      dehnat: [],
      supplierId: "",
    });
  };

  const handleSubmit = async () => {
    if (!orderId || items.length === 0) {
      return alert("Order ID and at least one item are required.");
    }
    setIsSubmitting(true);
    const payload = {
      orderId: parseInt(orderId, 10),
      items: items.map((i) => ({
        productId: parseInt(i.productId, 10),
        fabrics: i.fabrics,
        eshra: i.eshra,
        paintings: i.paintings,
        marble: i.marble,
        dehnat: i.dehnat,
        supplierId: i.supplierId,
      })),
      statusSla: normalizeSla(statusSla),
    };
    const res = await fetch("/api/Order/CreateOrder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      alert("Created!");
      await refreshList();
      onClose();
    } else {
      const err = await res.json();
      alert("Error: " + (err.message || err.error));
    }
    setIsSubmitting(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3>➕ New Order</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Order Basics */}
        <div className="section-card">
          <div className="section-title-row">
            <h4>Order Details</h4>
          </div>
          <div className="form-grid two-col">
            <div>
              <label>Order ID</label>
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter order ID"
              />
            </div>
            <div>
              <label>Supplier</label>
              <select
                value={itemDraft.supplierId}
                onChange={(e) =>
                  setItemDraft((d) => ({ ...d, supplierId: e.target.value }))
                }
              >
                <option value="">— Select supplier —</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Product & Customizations */}
        <div className="section-card">
          <div className="section-title-row">
            <h4>Select Product & Customizations</h4>
          </div>
          <label>Product</label>
          <select
            name="productId"
            value={itemDraft.productId}
            onChange={handleProductChange}
          >
            <option value="">— Select product —</option>
            {products.map((p) => (
              <option key={p.productId} value={p.productId}>
                {p.name} (#{p.productId})
              </option>
            ))}
          </select>

          {selProd && (
            <div className="form-grid two-col">
              {["fabrics", "eshra", "paintings", "marble", "dehnat"].map(
                (field) => (
                  <div key={field}>
                    <label>
                      {field.charAt(0).toUpperCase() + field.slice(1)}{" "}
                      (multi-select)
                    </label>
                    <select
                      multiple
                      value={itemDraft[field]}
                      onChange={(e) => handleMultiSelectChange(field, e)}
                    >
                      {selProd[field].map((opt) => (
                        <option key={opt._id} value={opt._id}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Advanced (optional) */}
        <div className="section-card">
          <div className="section-title-row">
            <h4>Advanced (optional)</h4>
            <button
              className="add-item-btn"
              onClick={() => setShowAdvanced((v) => !v)}
            >
              {showAdvanced ? "Hide" : "Show"}
            </button>
          </div>
          {showAdvanced && (
            <div className="sla-grid">
              {["New", "manufacturing", "Done"].map((st) => (
                <div key={st} className="sla-card">
                  <div className="sla-title">{st}</div>
                  <div className="sla-fields">
                    <label>Green ≤</label>
                    <input
                      type="number"
                      min="0"
                      value={statusSla[st].greenDays}
                      onChange={(e) =>
                        setStatusSla((s) => ({
                          ...s,
                          [st]: { ...s[st], greenDays: e.target.value },
                        }))
                      }
                    />
                    <label>Orange ≤</label>
                    <input
                      type="number"
                      min="0"
                      value={statusSla[st].orangeDays}
                      onChange={(e) =>
                        setStatusSla((s) => ({
                          ...s,
                          [st]: { ...s[st], orangeDays: e.target.value },
                        }))
                      }
                    />
                    <label>Red ≤</label>
                    <input
                      type="number"
                      min="0"
                      value={statusSla[st].redDays}
                      onChange={(e) =>
                        setStatusSla((s) => ({
                          ...s,
                          [st]: { ...s[st], redDays: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Items Section */}
        <div className="section-card">
          <div className="section-title-row">
            <h4>Items ({items.length})</h4>
            <button
              className="add-item-btn"
              onClick={addItem}
              disabled={
                !itemDraft.productId ||
                itemDraft.fabrics.length === 0 ||
                !itemDraft.supplierId
              }
            >
              + Add Item
            </button>
          </div>
          {items.length === 0 ? (
            <p className="muted">No items added yet</p>
          ) : (
            <ul className="item-list">
              {items.map((it, i) => (
                <li key={i}>
                  <div>
                    <strong>
                      {
                        products.find(
                          (p) => p.productId.toString() === it.productId
                        )?.name
                      }
                    </strong>
                    <div className="muted">
                      Supplier:{" "}
                      {suppliers.find((s) => s._id === it.supplierId)?.name}
                    </div>
                    <div className="muted">
                      Fabrics: {it.fabrics.length}, Eshra: {it.eshra.length},
                      Paintings: {it.paintings.length}, Marble:{" "}
                      {it.marble.length}, Dehnat: {it.dehnat.length}
                    </div>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() =>
                      setItems((arr) => arr.filter((_, idx) => idx !== i))
                    }
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="modal-buttons">
          <button
            onClick={handleSubmit}
            disabled={!orderId || items.length === 0 || isSubmitting}
          >
            {isSubmitting ? "Saving…" : "💾 Save Order"}
          </button>
          <button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddOrderModal;
