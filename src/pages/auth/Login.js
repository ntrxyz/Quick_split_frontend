import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // Import Axios
import config from "../../Config"; // ✅ Import backend config
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // To navigate after login

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    try {
      const response = await axios.post(
        `${config.backendUrl}/auth/login`,
        null, // ✅ `data` must be `null` since we're using `params`
        {
          params: { email, password }, // ✅ Send email & password as query params
          withCredentials: true,
        }
      );

      console.log("🔹 API Response:", response.data); // ✅ Debug API response

      if (response.status === 200) {
        const token = response.data.token;
        const userId = response.data.userId;

        if (!token || !userId) {
          console.error("❌ Missing token or userId in response.");
          throw new Error("Invalid API response.");
        }

        // ✅ Store token with the correct key
        localStorage.setItem("authToken", token);
        localStorage.setItem("userId", userId);

        console.log("✅ Token saved:", localStorage.getItem("authToken"));
        console.log("✅ User ID saved:", localStorage.getItem("userId"));

        navigate("/dashboard"); // Redirect after login
      }
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      console.error("Login error:", err.response?.data || err.message);
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
      </div>
    </div>
  );
};

export default Login;
