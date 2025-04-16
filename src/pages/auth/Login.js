import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../Config";
import "./Login.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the CSS for Toastify

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post(
        `${config.backendUrl}/auth/login`,
        null,
        {
          params: { email, password },
          withCredentials: true,
        }
      );

      console.log("🔹 API Response:", response.data);

      if (response.status === 200) {
        const token = response.data.token;
        const userId = response.data.userId;

        if (!token || !userId) {
          console.error("❌ Missing token or userId in response.");
          throw new Error("Invalid API response.");
        }

        localStorage.setItem("authToken", token);
        localStorage.setItem("userId", userId);

        console.log("✅ Token saved:", localStorage.getItem("authToken"));
        console.log("✅ User ID saved:", localStorage.getItem("userId"));

        // Success toast notification
        toast.success("Login successful! Redirecting to dashboard...");
        setTimeout(() => {
          navigate("/dashboard"); // Redirect after a short delay
        }, 1000); 
        
      }
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      console.error("Login error:", err.response?.data || err.message);

      // Error toast notification
      toast.error("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p>Log in to continue managing your expenses</p>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">Login</button>
        </form>

        <p className="register-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>

        {/* Toast Container for notifications */}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default Login;