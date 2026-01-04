import React from "react";
import "../CSS/AddOrderModal.css"; // reuse aom-* styles

const ProductDetailModal = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <div className="aom-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="aom-modal" role="dialog" aria-modal="true" aria-labelledby="aom-title">
        {/* Header */}
        <div className="aom-header">
          <h3 id="aom-title">🛍 Product #{product.productId}</h3>
          <button type="button" className="aom-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Product Info */}
        <section className="aom-card">
          <div className="aom-field">
            <label>Name</label>
            <div className="aom-muted">{product.name || "—"}</div>
          </div>

          <div className="aom-field">
            <label>Description</label>
            <div className="aom-muted">{product.description || "—"}</div>
          </div>

          <div className="aom-field">
            <label>Supplier</label>
            <div className="aom-muted">
              {product.supplier?.name || product.supplierId || "—"}
            </div>
          </div>

          {product.images && (
            <div className="aom-field">
              <label>Image</label>
              <img
                src={product.images}
                alt={product.name}
                style={{ maxWidth: "100%", borderRadius: "6px" }}
              />
            </div>
          )}
        </section>

        {/* Customizations */}
        <section className="aom-card">
          <div className="aom-card-title">Customizations</div>
          <div className="aom-grid aom-2">
            {["fabrics", "eshra", "paintings", "marble", "glass"].map((field) => (
              <div key={field} className="aom-field">
                <label>{field[0].toUpperCase() + field.slice(1)}</label>
                {product[field]?.length ? (
                  <div className="aom-chips">
                    {product[field].map((opt) => (
                      <span key={opt._id || opt} className="aom-chip">
                        {opt.name || opt}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="aom-muted">None</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="aom-footer">
          <button type="button" className="aom-ghost" onClick={onClose}>
            ✖️ Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
