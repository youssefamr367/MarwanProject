import { useState } from "react";
import { Link } from "react-router-dom";
import "../CSS/Navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <Link to="/" onClick={() => setIsMenuOpen(false)}>
        <h1>AURORA</h1>
      </Link>
      <button 
        className="menu-toggle"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <ul className={isMenuOpen ? "nav-menu active" : "nav-menu"}>
        <li>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
        </li>
        <li>
          <Link to="/products" onClick={() => setIsMenuOpen(false)}>Products</Link>
        </li>
        <li>
          <Link to="/orders" onClick={() => setIsMenuOpen(false)}>Orders</Link>
        </li>
        <li>
          <Link to="/suppliers" onClick={() => setIsMenuOpen(false)}>Suppliers</Link>
        </li>
        <li>
          <Link to="/Materials" onClick={() => setIsMenuOpen(false)}>Materials</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
