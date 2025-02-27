import React from "react";
import { Link } from "react-router-dom";

import "./Home.css"; // Import CSS for Home Page styling
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import heroBg from "../../assets/finance.jpeg"
import { Container } from "react-bootstrap";

const Home = () => {
  return (
    <div className="home-container">
      <Navbar /> {/* Include Navbar Component */}

      {/* Hero Section */}
      <header className="hero" style={{ backgroundImage: `url(${heroBg})` }}>
       <div></div>
      </header>

      <Container>
      <div className="hero-content">
          <h2>Split Bills Effortlessly with Friends & Family</h2>
          <p>Track expenses, share costs, and settle debts with ease.</p>
          <Link to="/signup" className="cta-btn">Get Started</Link>
        </div>
        </Container>

      {/* Features Section */}
      <section className="features">
        <h3>Why Use Our App?</h3>
        <div className="feature-list">
          <div className="feature">
            <h4>💰 Track Expenses</h4>
            <p>Never forget who owes whom.</p>
          </div>
          <div className="feature">
            <h4>📊 Clear Reports</h4>
            <p>Understand your spending habits.</p>
          </div>
          <div className="feature">
            <h4>🔄 Settle Easily</h4>
            <p>Quickly pay back friends.</p>
          </div>
        </div>
      </section>

      <Footer /> {/* Include Footer Component */}
    </div>
  );
};

export default Home;
