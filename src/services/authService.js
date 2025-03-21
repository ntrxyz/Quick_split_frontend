import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/auth";

export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/register`, userData, {
            headers: { "Content-Type": "application/json" }
        });
        
        return response.data; // { message, token }
    } catch (error) {
        console.error("Registration Error:", error.response?.data?.message || error.message);
        throw error.response?.data || error;
    }
};

export const loginUser = async (email, password) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
            {}, // Empty body (params are in URL)
            { headers: { "Content-Type": "application/json" } }
        );
        
        return response.data; // { message, token, userId }
    } catch (error) {
        console.error("Login Error:", error.response?.data?.message || error.message);
        throw error.response?.data || error;
    }
};
