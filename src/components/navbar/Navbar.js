import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Import the CSS file
import logo from "../../assets/logo.png"

const Navbar = () => {
  return (
    <nav className="navbar">
      {/* Logo and Title */}
      <div className="logo-container">
        <img src={logo} alt="App Logo" className="app-logo" />
        <h1>Quick-Split</h1>
      </div>

      {/* Navigation Links */}
      <div>
        <Link to="/login" className="nav-btn">Login</Link>
        <Link to="/signup" className="nav-btn signup">Sign Up</Link>
      </div>
    </nav>
  );
};

export default Navbar;
