import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // Import Axios
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
        "http://localhost:8080/api/auth/login",
        null, // ✅ Since we're using `params`, `data` must be `null`
        {
          params: { email, password }, // ✅ Send credentials as `params`
          withCredentials: true, // ✅ Ensure authentication tokens are handled properly
        }
      );

      if (response.status === 200) {
        const { token, userId } = response.data;

        // Store token in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId);

        console.log("Login successful:", response.data);
        navigate("/dashboard"); // Redirect to dashboard after login
      }
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      console.error("Login error:", err);
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
