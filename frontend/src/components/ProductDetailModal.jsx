import { useState, useEffect } from "react";
import "../CSS/ProductDetailModal.css";

const ProductDetailModal = ({ product, onClose }) => {
    const [details, setDetails] = useState(null);

    useEffect(() => {
        const fetchProd = async () => {
            const res  = await fetch(`/api/Product/GetbyProductId/${product.productId}`);
            const json = await res.json();
            if (res.ok) setDetails(json);
        };
        fetchProd();
    }, [product.productId]);

    if (!details) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <h3>Product #{details.productId}</h3>
                <p><strong>Name:</strong> {details.name}</p>
                <p><strong>Description:</strong> {details.description}</p>

                <p>
                    <strong>Fabrics:</strong>{" "}
                    {details.fabrics.map(f => f.name).join(", ")}
                </p>
                <p>
                    <strong>Eshra:</strong>{" "}
                    {details.eshra.map(e => e.name).join(", ")}
                </p>
                <p>
                    <strong>Paintings:</strong>{" "}
                    {details.paintings.map(p => p.name).join(", ")}
                </p>
                <p>
                    <strong>Marble:</strong>{" "}
                    {details.marble.map(m => m.name).join(", ")}
                </p>
                <p>
                    <strong>Dehnat:</strong>{" "}
                    {details.dehnat.map(d => d.name).join(", ")}
                </p>

                <div className="modal-buttons">
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;
