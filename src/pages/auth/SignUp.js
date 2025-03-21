import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../Config"; // ✅ Import backend config
import "./SignUp.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate(); // Use navigate for redirection

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required!");
      return;
    }

    try {
      const response = await axios.post(`${config.backendUrl}/auth/register`, formData, {
        withCredentials: true, // ✅ Ensure cookies (if needed)
      });

      console.log("🔹 Signup API Response:", response.data); // ✅ Debug API response

      if (response.status === 200) {
        navigate("/login"); // Redirect to login page
      }
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
      console.error("❌ Signup error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Create an Account</h2>
        <p>Create a free account to manage expenses.</p>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="signup-btn">Sign Up</button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
