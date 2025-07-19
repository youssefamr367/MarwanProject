import { useState } from "react";
import ItemDetailModal from "./ItemDetailModal";
import "../CSS/OrderDetailModal.css";

const OrderDetailModal = ({ order, onClose, refreshList }) => {
    const [selectedItem, setSelectedItem] = useState(null);

    const updateStatus = async (newStatus) => {
        await fetch(`/api/Order/updateByProductId/${order.orderId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });
        refreshList();
        onClose();
    };

    const deleteOrder = async () => {
        if (!window.confirm("Delete this order?")) return;
        await fetch(`/api/Order/deleteByOrderId/${order.orderId}`, {
            method: "DELETE"
        });
        refreshList();
        onClose();
    };

    // decide which status buttons to show
    const actions = [];
    if (order.status === "New") {
        actions.push({ label: "Move to Manufacturing", next: "manufacturing" });
    } else if (order.status === "manufacturing") {
        actions.push({ label: "Back to New", next: "New" });
        actions.push({ label: "Move to Ready", next: "Done" });
    } else if (order.status === "Done") {
        actions.push({ label: "Back to Manufacturing", next: "manufacturing" });
    }

    return (
        <>
            <div
                className="modal-backdrop"
                onClick={onClose}                    /* click outside → close */
            >
                <div
                    className="modal-box"
                    onClick={e => e.stopPropagation()} /* clicks inside → don’t close */
                >
                    <h3>Order #{order.orderId}</h3>
                    <p><strong>Status:</strong> {order.status}</p>

                    <h4>Items</h4>
                    <ul className="product-list">
                        {order.items.map((item, idx) => (
                            <li key={idx}>
                                <button
                                    className="link-button"
                                    onClick={() => setSelectedItem(item)}
                                >
                                    {item.product?.name} (#{item.product?.productId})
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="modal-buttons">
                        {actions.map(a => (
                            <button
                                key={a.next}
                                className="action-btn"
                                onClick={() => updateStatus(a.next)}
                            >
                                {a.label}
                            </button>
                        ))}

                        <button
                            className="action-btn delete-btn"
                            onClick={deleteOrder}
                        >
                            Delete Order
                        </button>

                        <button onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>

            {selectedItem && (
                <ItemDetailModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </>
    );
};

export default OrderDetailModal;
