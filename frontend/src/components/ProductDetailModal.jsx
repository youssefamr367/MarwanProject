import { useState, useEffect } from "react";
import "../CSS/ProductDetailModal.css";

const ProductDetailModal = ({ product, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProd = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/Product/GetbyProductId/${product.productId}`
        );
        const json = await res.json();
        if (res.ok) setDetails(json);
      } catch (error) {
        console.error("Failed to fetch product details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProd();
  }, [product.productId]);

  if (loading) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <div className="loading">Loading product details...</div>
        </div>
      </div>
    );
  }

  if (!details) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>Product #{details.productId}</h3>

        <div className="product-info">
          <p>
            <strong>Name:</strong> {details.name}
          </p>
          <p>
            <strong>Description:</strong> {details.description}
          </p>
        </div>

        <div className="material-category fabrics">
          <h4>Fabrics</h4>
          <ul className="material-list">
            {details.fabrics.map((f, index) => (
              <li key={index} className="material-item">
                {f.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="material-category eshra">
          <h4>Eshra</h4>
          <ul className="material-list">
            {details.eshra.map((e, index) => (
              <li key={index} className="material-item">
                {e.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="material-category paintings">
          <h4>Paintings</h4>
          <ul className="material-list">
            {details.paintings.map((p, index) => (
              <li key={index} className="material-item">
                {p.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="material-category marble">
          <h4>Marble</h4>
          <ul className="material-list">
            {details.marble.map((m, index) => (
              <li key={index} className="material-item">
                {m.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="material-category dehnat">
          <h4>Dehnat</h4>
          <ul className="material-list">
            {details.dehnat.map((d, index) => (
              <li key={index} className="material-item">
                {d.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="modal-buttons">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
