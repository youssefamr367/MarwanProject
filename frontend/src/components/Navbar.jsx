import { Link } from "react-router-dom";
import "../CSS/Navbar.css";

const Navbar = () => (
  <nav className="navbar">
    <Link to="/">
      <h1>AURORA</h1>
    </Link>
    <ul>
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>
        <Link to="/products">Products</Link>
      </li>
      <li>
        <Link to="/orders">Orders</Link>
      </li>
      <li>
        <Link to="/suppliers">Suppliers</Link>
      </li>
      <li>
        <Link to="/Materials">Materials</Link>
      </li>
    </ul>
  </nav>
);

export default Navbar;
