import React from "react";
import "./Footer.css";
import logo from "../../assets/logo.jpeg";
import googleplay from "../../assets/googleplay.png";
import appleplay from "../../assets/appleplay.png";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Left Section - Logo & About */}
        <div className="footer-left">
          <img src={logo} className="logofooter" alt="Quick-Split Logo" /> 
          <p>Split bills effortlessly with friends & family.</p>
        </div>

        {/* Center Sections - About, Support, Contact */}
        <div className="footer-section">
          <h3>About</h3>
          <ul>
            <li><a href="/about">Our Story</a></li>
            <li><a href="/team">Our Team</a></li>
            <li><a href="/careers">Careers</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Support</h3>
          <ul>
            <li><a href="/faq">FAQs</a></li>
            <li><a href="/help">Help Center</a></li>
            <li><a href="/terms">Terms & Conditions</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>
          <ul>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/feedback">Feedback</a></li>
            <li><a href="/press">Press</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Section - Google Play (Left), Center Text, Apple Store (Right) */}
      <div className="footer-bottom">
        <img src={googleplay} alt="Google Play" />
        <p>© 2025 Quick-Split. All rights reserved.</p>
        <img src={appleplay} alt="Apple Store" />
      </div>
    </footer>
  );
};

export default Footer;
