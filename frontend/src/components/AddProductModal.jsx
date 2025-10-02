import { useState, useEffect } from "react";
import "../CSS/ProductModal.css";
import React from "react";

const AddProductModal = ({ onClose, refreshList }) => {
  const [form, setForm] = useState({
    productId: "",
    name: "",
    description: "",
    fabrics: [],
    eshra: [],
    paintings: [],
    marble: [],
    dehnat: [],
    images: ""
  });

  const [lists, setLists] = useState({
    fabrics: [],
    eshra: [],
    paintings: [],
    marble: [],
    dehnat: [],
    suppliers: []
  });

  const [sel, setSel] = useState({
    fabrics: "",
    eshra: "",
    paintings: "",
    marble: "",
    dehnat: "",
    supplier: ""
  });

  // Fetch dropdown data
  useEffect(() => {
    Promise.all([
      fetch("/api/fabrics/all").then(r => r.json()),
      fetch("/api/eshra/all").then(r => r.json()),
      fetch("/api/paintings/all").then(r => r.json()),
      fetch("/api/marbles/all").then(r => r.json()),
      fetch("/api/dehnat/all").then(r => r.json()),
      fetch("/api/suppliers/all").then(r => r.json())
    ])
      .then(([f, e, p, m, d, s]) => {
        setLists({ fabrics: f, eshra: e, paintings: p, marble: m, dehnat: d, suppliers: s });
      })
      .catch(console.error);
  }, []);

  // Handle input change
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Add tag selection
  const addTag = field => {
    const id = sel[field];
    if (!id) return;
    setForm(f => ({
      ...f,
      [field]: f[field].includes(id) ? f[field] : [...f[field], id]
    }));
    setSel(s => ({ ...s, [field]: "" }));
  };

  // Remove tag
  const removeTag = (field, id) => {
    setForm(f => ({
      ...f,
      [field]: f[field].filter(x => x !== id)
    }));
  };

  // Submit form
  const handleSubmit = async () => {
    if (!form.productId || !form.name || !sel.supplier) {
      return alert("ID, Name & Supplier required");
    }
    const payload = {
      ...form,
      productId: parseInt(form.productId, 10),
      supplier: sel.supplier
    };
    const res = await fetch("/api/Product/CreateProduct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      alert("Product Added!");
      refreshList();
      onClose();
    } else {
      const err = await res.json();
      alert("Error: " + err.message);
    }
  };

  // Helper to find name by ID
  const findName = (arr, id) => arr.find(x => x._id === id)?.name || id;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>New Product</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="form-group">
            <label>Product ID</label>
            <input name="productId" value={form.productId} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Supplier</label>
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

          {/* Dynamic fields */}
          {["fabrics", "eshra", "paintings", "marble", "dehnat"].map(field => (
            <div className="form-group" key={field}>
              <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <div className="tag-input">
                <select
                  value={sel[field]}
                  onChange={e => setSel(s => ({ ...s, [field]: e.target.value }))}
                >
                  <option value="">— Select —</option>
                  {lists[field].map(opt => (
                    <option key={opt._id} value={opt._id}>{opt.name}</option>
                  ))}
                </select>
                <button type="button" onClick={() => addTag(field)}>Add</button>
              </div>
              <div className="tag-list">
                {form[field].map(id => (
                  <span key={id} className="tag">
                    {findName(lists[field], id)}
                    <button className="remove-btn" onClick={() => removeTag(field, id)}>×</button>
                  </span>
                ))}
              </div>
            </div>
          ))}

          <div className="form-group">
            <label>Image URL</label>
            <input name="images" value={form.images} onChange={handleChange} />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            onClick={handleSubmit}
            disabled={!form.productId || !form.name || !sel.supplier}
          >
            Save Product
          </button>
          <button onClick={onClose} className="btn-cancel">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
