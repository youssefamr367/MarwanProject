import { useState, useEffect } from "react";
import "../CSS/AddOrderModal.css";
import React from "react";

const AddOrderModal = ({ onClose, refreshList }) => {
    const [orderId, setOrderId]     = useState("");
    const [products, setProducts]   = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [itemDraft, setItemDraft] = useState({
        productId: "", fabrics: [], eshra: [], paintings: [], marble: [], dehnat: [], supplierId: ""
    });
    const [selection, setSelection] = useState({
        fabrics: "", eshra: "", paintings: "", marble: "", dehnat: ""
    });
    const [items, setItems] = useState([]);

    useEffect(() => {
        fetch("/api/Product/getAllProduct")
            .then(r => r.json())
            .then(setProducts);
        fetch("/api/suppliers/all")
            .then(r => r.json())
            .then(setSuppliers);
    }, []);

    const selProd = products.find(p => p.productId.toString() === itemDraft.productId);

    const handleProductChange = e => {
        setItemDraft({
            productId:   e.target.value,
            fabrics:[], eshra:[], paintings:[], marble:[], dehnat:[], supplierId:""
        });
        setSelection({ fabrics:"", eshra:"", paintings:"", marble:"", dehnat:"" });
    };

    const handleSelectionChange = e => {
        const { name, value } = e.target;
        setSelection(s => ({ ...s, [name]: value }));
    };

    const addCustomization = name => {
        const val = selection[name];
        if (!val) return;
        setItemDraft(d => ({
            ...d,
            [name]: d[name].includes(val) ? d[name] : [...d[name], val]
        }));
        setSelection(s => ({ ...s, [name]:"" }));
    };

    const removeCustomization = (name, val) => {
        setItemDraft(d => ({
            ...d,
            [name]: d[name].filter(x => x !== val)
        }));
    };

    const addItem = () => {
        const { productId, fabrics, supplierId } = itemDraft;
        if (!productId || fabrics.length===0 || !supplierId) {
            return alert("Product, at least one fabric, and a supplier are required.");
        }
        setItems(i => [...i, itemDraft]);
        setItemDraft({ productId:"", fabrics:[], eshra:[], paintings:[], marble:[], dehnat:[], supplierId:"" });
    };

    const handleSubmit = async () => {
        if (!orderId || items.length===0) {
            return alert("Order ID and at least one item are required.");
        }
        const payload = {
            orderId: parseInt(orderId,10),
            items: items.map(i => ({
                productId:  parseInt(i.productId,10),
                fabrics:    i.fabrics,
                eshra:      i.eshra,
                paintings:  i.paintings,
                marble:     i.marble,
                dehnat:     i.dehnat,
                supplierId: i.supplierId
            }))
        };
        const res = await fetch("/api/Order/CreateOrder", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            alert("Created!");
            await refreshList();
            onClose();
        } else {
            const err = await res.json();
            alert("Error: "+(err.message||err.error));
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-box" onClick={e=>e.stopPropagation()}>
                <h3>New Order</h3>
                <label>Order ID</label>
                <input value={orderId} onChange={e=>setOrderId(e.target.value)} />

                <label>Product</label>
                <select name="productId" value={itemDraft.productId} onChange={handleProductChange}>
                    <option value="">— Select product —</option>
                    {products.map(p=>(
                        <option key={p.productId} value={p.productId}>
                            {p.name} (#{p.productId})
                        </option>
                    ))}
                </select>

                {selProd && ["fabrics","eshra","paintings","marble","dehnat"].map(field=>(
                    <div key={field}>
                        <label>{field.charAt(0).toUpperCase()+field.slice(1)}</label>
                        <div className="tag-input">
                            <select
                                name={field}
                                value={selection[field]}
                                onChange={handleSelectionChange}
                            >
                                <option value="">—</option>
                                {selProd[field].map(opt=>(
                                    <option key={opt._id} value={opt._id}>{opt.name}</option>
                                ))}
                            </select>
                            <button onClick={()=>addCustomization(field)}>Add</button>
                        </div>
                        <div className="tag-list">
                            {itemDraft[field].map(val=>(
                                <span key={val} className="tag">
                  {selProd[field].find(o=>o._id===val)?.name||val}
                                    <button onClick={()=>removeCustomization(field,val)}>×</button>
                </span>
                            ))}
                        </div>
                    </div>
                ))}

                <label>Supplier</label>
                <select
                    value={itemDraft.supplierId}
                    onChange={e=>setItemDraft(d=>({ ...d, supplierId: e.target.value }))}
                >
                    <option value="">— Select supplier —</option>
                    {suppliers.map(s=>(
                        <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                </select>

                <button onClick={addItem}>+ Add Item</button>
                <ul className="item-list">
                    {items.map((it,i)=>(
                        <li key={i}>
                            <strong>{products.find(p=>p.productId.toString()===it.productId)?.name}</strong><br/>
                            Fabrics: {it.fabrics.map(id=>selProd?.fabrics.find(o=>o._id===id)?.name).join(", ")}<br/>
                            …{/* similar for other fields */}
                            Supplier: {suppliers.find(s=>s._id===it.supplierId)?.name}
                        </li>
                    ))}
                </ul>

                <div className="modal-buttons">
                    <button onClick={handleSubmit}>Save Order</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default AddOrderModal;
