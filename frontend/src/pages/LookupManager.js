import React, { useState, useEffect, useCallback } from "react";
import "../CSS/LookupManager.css";

const LOOKUP_TYPES = [
    { label: "Fabrics",    value: "fabrics",    api: "/api/fabrics"   },
    { label: "Eshra",      value: "eshra",      api: "/api/eshra"     },
    { label: "Paintings",  value: "paintings",  api: "/api/paintings" },
    { label: "Marbles",    value: "marbles",    api: "/api/marbles"   },
    { label: "Dehnat",     value: "dehnat",     api: "/api/dehnat"    },
];

const LookupManager = () => {
    const [activeType, setActiveType] = useState(LOOKUP_TYPES[0].value);
    const [items, setItems]           = useState([]);
    const [newName, setNewName]       = useState("");

    const current = LOOKUP_TYPES.find(t => t.value === activeType);

    const fetchItems = useCallback(async () => {
        try {
            const res  = await fetch(`${current.api}/all`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed");
            setItems(data);
        } catch (err) {
            console.error(err);
            alert(`Error loading ${current.label}: ${err.message}`);
        }
    }, [current]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleAdd = async () => {
        const name = newName.trim();
        if (!name) return;
        try {
            const res = await fetch(`${current.api}/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setNewName("");
            fetchItems();
        } catch (err) {
            console.error(err);
            alert(`Error adding ${current.label.slice(0,-1)}: ${err.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`Delete this ${current.label.slice(0,-1)}?`)) return;
        try {
            const res = await fetch(`${current.api}/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            fetchItems();
        } catch (err) {
            console.error(err);
            alert(`Error deleting ${current.label.slice(0,-1)}: ${err.message}`);
        }
    };

    return (
        <div className="LookupManager">
            <h2>Customization Options</h2>

            {/* Tabs */}
            <div className="tabs">
                {LOOKUP_TYPES.map(t => (
                    <button
                        key={t.value}
                        className={t.value === activeType ? "tab active" : "tab"}
                        onClick={() => setActiveType(t.value)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Add new */}
            <div className="add-row">
                <input
                    type="text"
                    placeholder={`New ${current.label.slice(0, -1)}`}
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                />
                <button onClick={handleAdd}>Add</button>
            </div>

            {/* List */}
            <ul className="lookup-list">
                {items.map(item => (
                    <li key={item._id}>
                        {item.name}
                        <button className="del-btn" onClick={() => handleDelete(item._id)}>×</button>
                    </li>
                ))}
                {items.length === 0 && (
                    <li className="empty">No {current.label.toLowerCase()} defined.</li>
                )}
            </ul>
        </div>
    );
};

export default LookupManager;
