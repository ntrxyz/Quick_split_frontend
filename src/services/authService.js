import axios from "axios";

const API_URL = "http://localhost:8080/api/auth"; // Adjust if needed

// Register User
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error.response?.data || error);
    throw error;
  }
};

// Login User
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    const { token } = response.data;

    // Store token in localStorage
    localStorage.setItem("userToken", token);

    return response.data;
  } catch (error) {
    console.error("Login failed:", error.response?.data || error);
    throw error;
  }
};


