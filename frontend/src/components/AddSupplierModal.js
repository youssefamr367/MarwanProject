// src/components/AddSupplierModal.jsx
import { useState } from "react";
import "../CSS/SupplierModal.css";

const AddSupplierModal = ({ onClose, refreshList }) => {
    const [form, setForm] = useState({ name: "", number: "" });

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            alert("Name is required");
            return;
        }
        if (!form.number.trim()) {
            alert("Phone number is required");
            return;
        }
         if (!/^\d{11}$/.test(form.number)) {
                 alert("Phone number must be exactly 11 digits (0–9 only)");
                return;
               }
        const res = await fetch("/api/suppliers/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: form.name, number: form.number })
        });
        if (res.ok) {
            alert("Supplier added");
            refreshList();
            onClose();
        } else {
            const err = await res.json();
            alert("Error: " + err.message);
        }
    };

    return (
        <div className="modal-backdrop">
            <div
                 className="modal-backdrop"
                  onClick={onClose}                      /* click outside → close */
                >
                  <div
                    className="modal-box"
                    onClick={e => e.stopPropagation()}   /* clicks inside → don’t close */
                  >
                <h3>New Supplier</h3>

                <label>Name</label>
                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Supplier name"
                />

                <label>Phone Number</label>
                <input
                    name="number"
                    type="tel"
                    value={form.number}
                    onChange={handleChange}
                    pattern="\d{11}"
                    maxLength={11}
                    placeholder="e.g. 0123456789"
                />

                <div className="modal-buttons">
                    <button onClick={handleSubmit}>Add</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
            </div>
    );
};

export default AddSupplierModal;
