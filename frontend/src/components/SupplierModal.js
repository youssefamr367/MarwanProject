// src/components/SupplierModal.jsx
import { useState, useEffect } from "react";
import "../CSS/SupplierModal.css";

const SupplierModal = ({ supplier, onClose, refreshList }) => {
    const [form, setForm] = useState({ name: "", number: "" });

    useEffect(() => {
        setForm({
            name: supplier.name,
            number: supplier.number?.toString() || ""
        });
    }, [supplier]);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleSave = async () => {
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
        const res = await fetch(`/api/suppliers/${supplier._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: form.name, number: (form.number) })
        });
        if (res.ok) {
            alert("Supplier updated");
            refreshList();
            onClose();
        } else {
            const err = await res.json();
            alert("Error: " + err.message);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this supplier?")) return;

        const res = await fetch(`/api/suppliers/${supplier._id}`, {
            method: "DELETE"
        });
        const data = await res.json();

        if (!res.ok) {
            // Show the backend’s message
            alert(data.message || "Could not delete supplier");
            return;
        }

        // On success, refresh & close
        alert("Supplier deleted");
        refreshList();
        onClose();
    };

    return (
        <div
            className="modal-backdrop"
            onClick={onClose}                    /* click outside → close */
        >
            <div
                className="modal-box"
                onClick={e => e.stopPropagation()} /* clicks inside → don’t close */
            >
                <h3>Edit Supplier</h3>

                <label>Name</label>
                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
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
                    <button onClick={handleSave}>Save</button>
                    <button className="delete-btn" onClick={handleDelete}>
                        Delete
                    </button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default SupplierModal;
