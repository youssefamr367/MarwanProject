// @ts-ignore
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar            from "./components/Navbar";
import ProductList       from "./pages/ProductList";
import OrderList         from "./pages/OrderList";
import SupplierList      from "./pages/SupplierList";
import OrderDashboard    from "./pages/OrderDashboard";
import LookupManager     from "./pages/LookupManager";
import React from "react";

const App = () => (
    <Router>
        <Navbar />
        <div className="container">
            <Routes>
                <Route path="/"             element={<OrderDashboard />} />
                <Route path="/products"     element={<ProductList />} />
                <Route path="/orders"       element={<OrderList />} />
                <Route path="/suppliers"    element={<SupplierList />} />
                <Route path="/Materials"    element={<LookupManager />} />
            </Routes>
        </div>
    </Router>
);

export default App;
