import { useState, useEffect, useCallback } from "react";
import SupplierModal     from "../components/SupplierModal.jsx";
import AddSupplierModal  from "../components/AddSupplierModal.jsx";
import "../CSS/SupplierList.css";

const SupplierList = () => {
    const [suppliers,  setSuppliers]  = useState([]);
    const [selected,   setSelected]   = useState(null);
    const [showAdd,    setShowAdd]    = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // 1) Fetch all suppliers
    const fetchSuppliers = useCallback(async () => {
        const res  = await fetch("/api/suppliers/all");
        const data = await res.json();
        if (res.ok) setSuppliers(data);
    }, []);

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    // 2) Filter by name (case-insensitive)
    const filtered = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );

    return (
        <div className="SupplierList">
            <div className="header-row">
                <h2>All Suppliers</h2>
                <button className="add-button" onClick={() => setShowAdd(true)}>
                    + Add Supplier
                </button>
            </div>

            <div className="filter-row">
                <input
                    type="text"
                    placeholder="Search by name…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="supplier-grid">
                {filtered.map(s => (
                    <div
                        key={s._id}
                        className="supplier-card"
                        onClick={() => setSelected(s)}
                    >
                        <h3>{s.name}</h3>
                        <p>{s.number ? ` ${s.number}` : "No phone number"}</p>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <p className="no-results">No suppliers match your search.</p>
                )}
            </div>

            {selected && (
                <SupplierModal
                    supplier={selected}
                    onClose={() => setSelected(null)}
                    refreshList={fetchSuppliers}
                />
            )}

            {showAdd && (
                <AddSupplierModal
                    onClose={() => setShowAdd(false)}
                    refreshList={fetchSuppliers}
                />
            )}
        </div>
    );
};

export default SupplierList;
