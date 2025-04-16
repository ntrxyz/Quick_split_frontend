import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../Config";
import "./SignUp.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the Toastify CSS

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("All fields are required!");
      return;
    }

    try {
      const response = await axios.post(`${config.backendUrl}/auth/register`, formData, {
        withCredentials: true,
      });

      console.log("🔹 Signup API Response:", response.data);

      if (response.status === 200) {
        // Success toast notification
        toast.success("Signup successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/login"); // Redirect after a short delay
        }, 3000); // Wait 3 seconds before navigating
      }
    } catch (err) {
      console.error("❌ Signup error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Create an Account</h2>
        <p>Create a free account to manage expenses.</p>

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

        {/* Toast Container */}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default SignUp;