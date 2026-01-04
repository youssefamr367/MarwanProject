// src/components/SupplierModal.jsx
import { useState, useEffect } from "react";
import "../CSS/SupplierModal.css";

const SupplierModal = ({ supplier, onClose, refreshList }) => {
    const [form, setForm] = useState({ name: "", number: "" });
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

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
        if (loading || deleting) return;
        
        if (!form.name.trim()) {
            setError("Name is required");
            return;
        }
        if (!form.number.trim()) {
            setError("Phone number is required");
            return;
        }
        if (!/^\d{11}$/.test(form.number)) {
            setError("Phone number must be exactly 11 digits (0–9 only)");
            return;
        }
        
        setLoading(true);
        setError("");
        
        try {
            const res = await fetch(`/api/suppliers/${supplier._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: form.name, number: (form.number) })
            });
            
            const data = await res.json().catch(() => ({}));
            
            if (res.ok) {
                refreshList();
                onClose();
            } else {
                let errorMsg = data.message || data.error || "Failed to update supplier";
                setError(errorMsg);
            }
        } catch (err) {
            setError("Network error. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this supplier? This action cannot be undone.")) return;
        if (deleting || loading) return;

        setDeleting(true);
        setError("");

        try {
            const res = await fetch(`/api/suppliers/${supplier._id}`, {
                method: "DELETE"
            });
            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                refreshList();
                onClose();
            } else {
                let errorMsg = data.message || data.error || "Could not delete supplier";
                setError(errorMsg);
            }
        } catch (err) {
            setError("Network error. Please check your connection and try again.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div
            className="modal-backdrop"
            onClick={onClose}                    /* click outside → close */
        >
            <div
                className="modal-box"
                onClick={e => e.stopPropagation()} /* clicks inside → don't close */
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

                {error && (
                    <div style={{ background: "#fee", border: "1px solid #fcc", padding: "12px", margin: "12px 0", borderRadius: "4px" }}>
                        <strong style={{ color: "#c33" }}>Error:</strong> {error}
                    </div>
                )}
                
                <div className="modal-buttons">
                    <button onClick={handleSave} disabled={loading || deleting}>
                        {loading ? "⏳ Saving..." : "Save"}
                    </button>
                    <button 
                        className="delete-btn" 
                        onClick={handleDelete}
                        disabled={loading || deleting}
                    >
                        {deleting ? "⏳ Deleting..." : "Delete"}
                    </button>
                    <button onClick={onClose} disabled={loading || deleting}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default SupplierModal;
