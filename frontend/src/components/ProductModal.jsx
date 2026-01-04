import { useState, useEffect } from "react";
import "../CSS/AddOrderModal.css"; // reuse same aom-* design system

const ProductModal = ({ product, onClose, refreshList }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    fabrics: [],
    eshra: [],
    paintings: [],
    marble: [],
    glass: [],
    images: "",
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
    supplier: "",
  });

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Load lists + initialize form
  useEffect(() => {
    Promise.all([
      fetch("/api/fabrics/all").then(r => r.json()),
      fetch("/api/eshra/all").then(r => r.json()),
      fetch("/api/paintings/all").then(r => r.json()),
      fetch("/api/marbles/all").then(r => r.json()),
      fetch("/api/glass/all").then(r => r.json()),
      fetch("/api/suppliers/all").then(r => r.json()),
    ])
      .then(([f, e, p, m, d, s]) => {
        setLists({ fabrics: f, eshra: e, paintings: p, marble: m, glass: d, suppliers: s });
      })
      .catch(console.error);

    setForm({
      name: product.name,
      description: product.description,
      fabrics: product.fabrics.map(o => o._id),
      eshra: product.eshra.map(o => o._id),
      paintings: product.paintings.map(o => o._id),
      marble: product.marble.map(o => o._id),
      glass: product.glass.map(o => o._id),
      images: product.images || "",
    });
    setSel(s => ({ ...s, supplier: product.supplier?._id || "" }));
  }, [product]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const addTag = (field) => {
    const id = sel[field];
    if (!id) return;
    setForm(f => ({
      ...f,
      [field]: f[field].includes(id) ? f[field] : [...f[field], id],
    }));
    setSel(s => ({ ...s, [field]: "" }));
  };

  const removeTag = (field, id) => {
    setForm(f => ({
      ...f,
      [field]: f[field].filter(x => x !== id),
    }));
  };

  // ✅ Option A: Close modal only if save succeeded
  const handleSave = async () => {
    if (loading) return;
    
    setLoading(true);
    setError("");
    
    try {
      const payload = {
        ...form,
        supplier: sel.supplier,
      };

      const res = await fetch(`/api/Product/updateByProductId/${product.productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        await refreshList();
        onClose(); // closes only if success
      } else {
        let errorMsg = data.message || data.error || "Failed to update product";
        setError(errorMsg);
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this product? This action cannot be undone.")) return;
    if (deleting) return;
    
    setDeleting(true);
    setError("");
    
    try {
      const res = await fetch(`/api/Product/deleteByProductId/${product.productId}`, {
        method: "DELETE",
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (res.ok) {
        refreshList();
        onClose();
      } else {
        let errorMsg = data.message || data.error || "Failed to delete product";
        setError(errorMsg);
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setDeleting(false);
    }
  };

  const findName = (arr, id) => arr.find(x => x._id === id)?.name || id;

  return (
    <div className="aom-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="aom-modal" role="dialog" aria-modal="true" aria-labelledby="aom-title">
        {/* Header */}
        <div className="aom-header">
          <h3 id="aom-title">✏️ Edit {product.name}</h3>
          <button type="button" className="aom-close" onClick={onClose}>×</button>
        </div>

        {/* Product Info */}
        <section className="aom-card">
          <div className="aom-field">
            <label>Name <span className="req">*</span></label>
            <input name="name" value={form.name} onChange={handleChange} />
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
            <label>Supplier <span className="req">*</span></label>
            <select
              value={sel.supplier}
              onChange={e => setSel(s => ({ ...s, supplier: e.target.value }))}
            >
              <option value="">— Select —</option>
              {lists.suppliers.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
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
            {["fabrics", "eshra", "paintings", "marble", "glass"].map(field => (
              <div key={field} className="aom-field">
                <label>{field[0].toUpperCase() + field.slice(1)}</label>
                <div className="aom-inline">
                  <select
                    value={sel[field]}
                    onChange={e => setSel(s => ({ ...s, [field]: e.target.value }))}
                  >
                    <option value="">—</option>
                    {lists[field].map(opt => (
                      <option key={opt._id} value={opt._id}>{opt.name}</option>
                    ))}
                  </select>
                  <button type="button" className="aom-btn" onClick={() => addTag(field)}>
                    Add
                  </button>
                </div>

                {!!form[field].length && (
                  <div className="aom-chips">
                    {form[field].map(id => (
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
            ))}
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
            onClick={handleSave}
            disabled={loading || deleting}
          >
            {loading ? "⏳ Saving..." : "💾 Save Changes"}
          </button>
          <button 
            type="button" 
            className="aom-btn" 
            onClick={handleDelete}
            disabled={loading || deleting}
          >
            {deleting ? "⏳ Deleting..." : "🗑️ Delete"}
          </button>
          <button 
            type="button" 
            className="aom-ghost" 
            onClick={onClose}
            disabled={loading || deleting}
          >
            ✖️ Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
