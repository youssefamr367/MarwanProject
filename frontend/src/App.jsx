// @ts-ignore
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar            from "./components/Navbar.jsx";
import ProductList       from "./pages/ProductList.jsx";
import OrderList         from "./pages/OrderList.jsx";
import SupplierList      from "./pages/SupplierList.jsx";
import OrderDashboard    from "./pages/OrderDashboard.jsx";
import LookupManager     from "./pages/LookupManager.jsx";
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
