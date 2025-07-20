// src/pages/ProductList.jsx
import { useState, useEffect, useCallback } from "react";
import ProductModal from "../components/ProductModal.jsx";
import AddProductModal from "../components/AddProductModal.jsx";
import "../CSS/ProductList.css";

const ProductList = () => {
    const [products, setProducts] = useState([]);      // full list
    const [selected, setSelected] = useState(null);    // for edit modal
    const [showAdd, setShowAdd] = useState(false);     // for add modal
    const [searchTerm, setSearchTerm] = useState("");

    // 1) Define fetchProducts once
    const fetchProducts = useCallback(async () => {
        // Note the leading slash!
        const res  = await fetch("/api/Product/getAllProduct");
        const json = await res.json();
        if (res.ok) setProducts(json);
    }, []);

    // 2) Run it on mount
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // 3) filter in-memory by name or ID
    const filtered = products.filter(p => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return true;
        return (
            p.name.toLowerCase().includes(q) ||
            p.productId.toString().includes(q)
        );
    });

    return (
        <div className="ProductList">
            <div className="header-row">
                <h2>All Products</h2>
                <button className="add-button" onClick={() => setShowAdd(true)}>
                    + Add Product
                </button>
            </div>

            {/* Search bar */}
            <div className="search-row">
                <input
                    type="text"
                    placeholder="Search by name or ID…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="product-grid">
                {filtered.map(p => (
                    <div
                        key={p._id}
                        className="product-card"
                        onClick={() => setSelected(p)}
                    >
                        <h3>{p.name}</h3>
                        <p>ID: {p.productId}</p>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <p className="no-results">No products found.</p>
                )}
            </div>

            {/* 4) Edit modal passes fetchProducts so changes show up immediately */}
            {selected && (
                <ProductModal
                    product={selected}
                    onClose={() => setSelected(null)}
                    refreshList={fetchProducts}
                />
            )}

            {/* 5) Add modal also passes fetchProducts */}
            {showAdd && (
                <AddProductModal
                    onClose={() => setShowAdd(false)}
                    refreshList={fetchProducts}
                />
            )}
        </div>
    );
};

export default ProductList;
