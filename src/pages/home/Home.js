import React from "react";
import { Link } from "react-router-dom";
import { Container, Card, Button } from "react-bootstrap"; // Bootstrap Components

import "./Home.css"; // Import CSS for Home Page styling
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import heroBg from "../../assets/finance.jpeg";
import trackimg from "../../assets/indimg.jpeg";
import friendimg from "../../assets/friendsimg.jpeg";
import reportimg from "../../assets/reportimg.jpeg";

const Home = () => {
  return (
    <div className="home-container">
      <Navbar /> {/* Include Navbar Component */}

      {/* Hero Section */}
      <header
        className="hero"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover" }}
      >
        <Container>
          <div className="hero-content">
            <h2>Manage Your Finances Smarter</h2>
            <p>Track expenses, analyze reports, and settle payments with ease.</p>
            <Link to="/signup" className="cta-btn">
              Get Started
            </Link>
          </div>
        </Container>
      </header>

      {/* Features Section */}
      <section className="features">
        <h3>Why Use Quick-Split?</h3>
        <div className="feature-list">
          
          {/* Feature 1: Track Expenses (Styled as a Card) */}
          <Card style={{ width: "18rem" }} className="feature-card">
            <Card.Img variant="top" src={trackimg} />
            <Card.Body>
              <h4>💰 Track Expenses</h4>
              <p>Never forget who owes whom.</p>
              <Link to="/dashboard" type="button" className="btn btn-outline-success">Track</Link>
            </Card.Body>
          </Card>
          <Card style={{ width: "18rem" }} className="feature-card">
            <Card.Img variant="top" src={reportimg} />
            <Card.Body>
              <h4>📊 Clear Reports</h4>
              <p>Understand your spending habits.</p>
              <Link to="/dashboard" type="button" className="btn btn-outline-success">Reports</Link>
            </Card.Body>
          </Card>
          <Card style={{ width: "18rem" }} className="feature-card">
            <Card.Img variant="top" src={friendimg} />
            <Card.Body>
              <h4>🔄 Settle Easily</h4>
              <p>Quickly pay back friends.</p>
              <Link to="/dashboard" type="button" className="btn btn-outline-success">Settle</Link>
            </Card.Body>
          </Card>
        </div>
      </section>

      <Footer /> {/* Include Footer Component */}
    </div>
  );
};

export default Home;
