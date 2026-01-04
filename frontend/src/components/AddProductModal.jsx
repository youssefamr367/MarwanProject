import React, { useEffect, useState } from "react";
import "../CSS/AddOrderModal.css"; // reuse same CSS!

const AddProductModal = ({ onClose, refreshList }) => {
  // ----- State -----
  const [form, setForm] = useState({
    productId: "",
    name: "",
    description: "",
    fabrics: [],
    eshra: [],
    paintings: [],
    marble: [],
    glass: [],
    images: "",
    supplierId: "",
  });

  const [lists, setLists] = useState({
    fabrics: [],
    eshra: [],
    paintings: [],
    marble: [],
    glass: [],
    suppliers: [],
  });

  const [sel, setSel] = useState({
    fabrics: "",
    eshra: "",
    paintings: "",
    marble: "",
    glass: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ----- Effects -----
  useEffect(() => {
    Promise.all([
      fetch("/api/fabrics/all").then((r) => r.json()),
      fetch("/api/eshra/all").then((r) => r.json()),
      fetch("/api/paintings/all").then((r) => r.json()),
      fetch("/api/marbles/all").then((r) => r.json()),
      fetch("/api/glass/all").then((r) => r.json()),
      fetch("/api/suppliers/all").then((r) => r.json()),
    ])
      .then(([f, e, p, m, d, s]) => {
        setLists({
          fabrics: f,
          eshra: e,
          paintings: p,
          marble: m,
          glass: d,
          suppliers: s,
        });
      })
      .catch(console.error);
  }, []);

  // ----- Handlers -----
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSupplier = (e) => {
    setForm((f) => ({ ...f, supplierId: e.target.value }));
  };

  const handleSelectChange = (field, value) => {
    setSel((s) => ({ ...s, [field]: value }));
  };

  const addTag = (field) => {
    const id = sel[field];
    if (!id) return;
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(id) ? f[field] : [...f[field], id],
    }));
    setSel((s) => ({ ...s, [field]: "" }));
  };

  const removeTag = (field, id) => {
    setForm((f) => ({
      ...f,
      [field]: f[field].filter((x) => x !== id),
    }));
  };

  const handleSubmit = async () => {
    if (!form.productId || !form.name || !form.supplierId || loading) return;

    setLoading(true);
    setError("");

    try {
      const payload = {
        ...form,
        productId: parseInt(form.productId, 10),
        supplier: form.supplierId, // Map supplierId to supplier for backend
      };
      // Remove supplierId from payload since backend expects 'supplier'
      delete payload.supplierId;

      const res = await fetch("/api/Product/CreateProduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        refreshList();
        onClose();
      } else {
        // Improve error messages
        let errorMsg = data.message || data.error || "Failed to create product";
        
        // Check for duplicate product ID
        if (errorMsg.toLowerCase().includes("already exists") || 
            errorMsg.toLowerCase().includes("duplicate") ||
            res.status === 400) {
          errorMsg = `Product ID ${form.productId} already exists. Please use a different product ID.`;
        }
        
        // Check for invalid supplier
        if (errorMsg.toLowerCase().includes("supplier")) {
          errorMsg = "Invalid supplier selected. Please select a valid supplier.";
        }
        
        setError(errorMsg);
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const findName = (arr, id) => arr.find((x) => x._id === id)?.name || id;

  const formValid = form.productId && form.name && form.supplierId;

  // ----- UI -----
  return (
    <div className="aom-backdrop" onMouseDown={handleBackdrop}>
      <div
        className="aom-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="aom-title"
      >
        {/* Header */}
        <div className="aom-header">
          <h3 id="aom-title">New Product</h3>
          <button
            type="button"
            className="aom-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Product Info */}
        <section className="aom-card">
          <div className="aom-grid aom-2">
            <div className="aom-field">
              <label>
                Product ID <span className="req">*</span>
              </label>
              <input
                name="productId"
                value={form.productId}
                inputMode="numeric"
                placeholder="e.g. 101"
                onChange={handleChange}
              />
              {!form.productId && <div className="aom-hint">Required</div>}
            </div>

            <div className="aom-field">
              <label>
                Supplier <span className="req">*</span>
              </label>
              <select value={form.supplierId} onChange={handleSupplier}>
                <option value="">— Select supplier —</option>
                {lists.suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {!form.supplierId && <div className="aom-hint">Required</div>}
            </div>
          </div>

          <div className="aom-field">
            <label>
              Name <span className="req">*</span>
            </label>
            <input name="name" value={form.name} onChange={handleChange} />
            {!form.name && <div className="aom-hint">Required</div>}
          </div>

          <div className="aom-field">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="aom-textarea"
            />
          </div>
          
          <div className="aom-field">
            <label>Image URL</label>
            <input name="images" value={form.images} onChange={handleChange} />
          </div>
        </section>

        {/* Customizations */}
        <section className="aom-card">
          <div className="aom-card-title">Customizations</div>
          <div className="aom-grid aom-2">
            {["fabrics", "eshra", "paintings", "marble", "glass"].map(
              (field) => (
                <div key={field} className="aom-field">
                  <label>{field[0].toUpperCase() + field.slice(1)}</label>
                  <div className="aom-inline">
                    <select
                      value={sel[field]}
                      onChange={(e) =>
                        handleSelectChange(field, e.target.value)
                      }
                    >
                      <option value="">—</option>
                      {lists[field].map((opt) => (
                        <option key={opt._id} value={opt._id}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="aom-btn"
                      onClick={() => addTag(field)}
                    >
                      Add
                    </button>
                  </div>

                  {!!form[field].length && (
                    <div className="aom-chips">
                      {form[field].map((id) => (
                        <span key={id} className="aom-chip">
                          {findName(lists[field], id)}
                          <button
                            type="button"
                            className="aom-x"
                            onClick={() => removeTag(field, id)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div className="aom-card" style={{ background: "#fee", border: "1px solid #fcc", padding: "12px", margin: "16px 0" }}>
            <strong style={{ color: "#c33" }}>Error:</strong> {error}
          </div>
        )}

        {/* Footer */}
        <div className="aom-footer">
          <button
            type="button"
            className="aom-primary"
            disabled={!formValid || loading}
            onClick={handleSubmit}
          >
            {loading ? "⏳ Creating..." : "Save Product"}
          </button>
          <button 
            type="button" 
            className="aom-ghost" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
