import { useState, useEffect } from "react";
import "../CSS/ProductModal.css";
import React from "react";

const AddProductModal = ({ onClose, refreshList }) => {
  const [form, setForm] = useState({
    productId: "", name: "", description: "",
    fabrics: [], eshra: [], paintings: [], marble: [], dehnat: [], images: ""
  });

  const [lists, setLists] = useState({
    fabrics: [], eshra: [], paintings: [], marble: [], dehnat: [], suppliers: []
  });
  const [sel, setSel] = useState({
    fabrics: "", eshra: "", paintings: "", marble: "", dehnat: "", supplier: ""
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/fabrics/all").then(r=>r.json()),
      fetch("/api/eshra/all").then(r=>r.json()),
      fetch("/api/paintings/all").then(r=>r.json()),
      fetch("/api/marbles/all").then(r=>r.json()),
      fetch("/api/dehnat/all").then(r=>r.json()),
      fetch("/api/suppliers/all").then(r=>r.json())
    ]).then(([f, e, p, m, d, s])=>{
      setLists({ fabrics:f, eshra:e, paintings:p, marble:m, dehnat:d, suppliers:s });
    }).catch(console.error);
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f=>({ ...f, [name]: value }));
  };

  const addTag = (field) => {
    const id = sel[field];
    if (!id) return;
    setForm(f=>({
      ...f,
      [field]: f[field].includes(id)?f[field]:[...f[field], id]
    }));
    setSel(s=>({ ...s, [field]:"" }));
  };

  const removeTag = (field, id) => {
    setForm(f=>({
      ...f,
      [field]: f[field].filter(x=>x!==id)
    }));
  };

  const handleSubmit = async () => {
    if (!form.productId || !form.name || !sel.supplier) {
      return alert("ID, Name & Supplier required");
    }
    const payload = {
      ...form,
      productId: parseInt(form.productId,10),
      supplier:  sel.supplier
    };
    const res = await fetch("/api/Product/CreateProduct",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload)
    });
    if (res.ok) {
      refreshList();
      onClose();
    } else {
      const err = await res.json();
      alert("Error: "+err.message);
    }
  };

  const findName = (arr,id)=> arr.find(x=>x._id===id)?.name || id;

  const canSave = form.productId && form.name && sel.supplier;

  return (
    <div className="aom-backdrop" onClick={onClose}>
      <div className="aom-modal" onClick={e=>e.stopPropagation()}>
        
        {/* Header */}
        <div className="aom-header">
          <h3>Add New Product</h3>
          <button className="aom-close" onClick={onClose}>×</button>
        </div>

        {/* Fields */}
        <div className="aom-grid aom-2">
          <div className="aom-field">
            <label>Product ID <span className="req">*</span></label>
            <input name="productId" value={form.productId} onChange={handleChange}/>
          </div>
          <div className="aom-field">
            <label>Name <span className="req">*</span></label>
            <input name="name" value={form.name} onChange={handleChange}/>
          </div>
        </div>

        <div className="aom-field">
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange}/>
        </div>

        <div className="aom-field">
          <label>Supplier <span className="req">*</span></label>
          <select
            value={sel.supplier}
            onChange={e=>setSel(s=>({ ...s, supplier:e.target.value }))}
          >
            <option value="">— Select Supplier —</option>
            {lists.suppliers.map(s=>(<option key={s._id} value={s._id}>{s.name}</option>))}
          </select>
        </div>

        {/* Tags section */}
        {["fabrics","eshra","paintings","marble","dehnat"].map(field=>(
          <div className="aom-card" key={field}>
            <div className="aom-card-title">{field.charAt(0).toUpperCase()+field.slice(1)}</div>
            <div className="aom-inline">
              <select
                value={sel[field]}
                onChange={e=>setSel(s=>({ ...s, [field]: e.target.value }))}
              >
                <option value="">— Select —</option>
                {lists[field].map(opt=>(<option key={opt._id} value={opt._id}>{opt.name}</option>))}
              </select>
              <button className="aom-btn" type="button" onClick={()=>addTag(field)}>Add</button>
            </div>
            <div className="aom-chips">
              {form[field].map(id=>(
                <span key={id} className="aom-chip">
                  {findName(lists[field],id)}
                  <button className="aom-x" onClick={()=>removeTag(field,id)}>×</button>
                </span>
              ))}
            </div>
          </div>
        ))}

        <div className="aom-field">
          <label>Image URL</label>
          <input name="images" value={form.images} onChange={handleChange}/>
        </div>

        {/* Footer */}
        <div className="aom-footer">
          <button className="aom-primary" disabled={!canSave} onClick={handleSubmit}>Save Product</button>
          <button className="aom-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
