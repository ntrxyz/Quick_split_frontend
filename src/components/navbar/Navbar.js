import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import logo from "../../assets/logo.jpeg";
import { FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="logo-container">
        <img src={logo} alt="App Logo" className="app-logo" />
        <h1>Quick-Split</h1>
      </div>

      {/* Hamburger Menu for Mobile */}
      <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <FaTimes /> : <FaBars />}
      </div>

      {/* Navigation Links */}
      <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
        <li><Link to="/login" className="nav-btn">Login</Link></li>
        <li><Link to="/signup" className="nav-btn signup">Sign Up</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
