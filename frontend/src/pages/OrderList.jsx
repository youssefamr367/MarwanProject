import { useState, useEffect, useCallback } from "react";
import OrderDetailModal from "../components/OrderDetailModal.jsx";
import AddOrderModal   from "../components/AddOrderModal.jsx";
import "../CSS/OrderList.css";

// show label to user, but filter by the exact status value
const STATUS_OPTIONS = [
    { label: "All Statuses",     value: ""             },
    { label: "New",              value: "New"          },
    { label: "In Manufacturing", value: "manufacturing"},
    { label: "Ready to Move",    value: "Done"         },
    { label: "Finished",         value: "finished"     }
];

const OrderList = () => {
    const [orders,       setOrders]       = useState([]);
    const [selected,     setSelected]     = useState(null);
    const [showAdd,      setShowAdd]      = useState(false);
    const [searchTerm,   setSearchTerm]   = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const fetchOrders = useCallback(async () => {
        try {
            const res  = await fetch("/api/Order/getAllOrders");
            const data = await res.json();
            if (res.ok) setOrders(data);
        } catch (err) {
            console.error("Failed to load orders:", err);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // apply both filters
    const filtered = orders.filter(o => {
        const matchesSearch = o.orderId.toString().includes(searchTerm.trim());
        const matchesStatus =
            statusFilter === "" ||
            o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="OrderList">
            <div className="header-row">
                <h2>All Orders</h2>
                <button className="add-button" onClick={() => setShowAdd(true)}>
                    + Add Order
                </button>
            </div>

            <div className="filter-row">
                <input
                    type="text"
                    placeholder="Search by Order ID…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="search-input"
                />

                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="status-select"
                >
                    {STATUS_OPTIONS.map(({ label, value }) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>

            <div className="order-grid">
                {filtered.map(order => (
                    <div
                        key={order._id}
                        className="order-card"
                        onClick={() => setSelected(order)}
                    >
                        <h3>Order #{order.orderId}</h3>
                        <p>Status: {order.status}</p>
                        <p>Items: {order.items.length}</p>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <p className="no-results">No orders match your criteria.</p>
                )}
            </div>

            {selected && (
                <OrderDetailModal
                    order={selected}
                    onClose={() => setSelected(null)}
                    refreshList={fetchOrders}
                />
            )}

            {showAdd && (
                <AddOrderModal
                    onClose={() => setShowAdd(false)}
                    refreshList={fetchOrders}
                />
            )}
        </div>
    );
};

export default OrderList;
