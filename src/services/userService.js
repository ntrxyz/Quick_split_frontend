import axios from "axios";
import config from "../Config";

const API_URL = `${config.backendUrl}/users`; // Corrected API URL

// ✅ Get Token from Local Storage
const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ Get User Profile
export const getUserProfile = async (userId) => {
    try {
        console.log(`🛠 Fetching user profile for ID: ${userId}`); // Debug log

        const response = await axios.get(`${API_URL}/${userId}`, {
            headers: getAuthHeader(),
        });

        console.log("📡 API Response Data:", response.data); // Log API response
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching user profile:", error.response?.data || error.message);
        throw error;
    }
};


// ✅ Update User Profile
export const updateUserProfile = async (userId, updatedData) => {
    try {
        const response = await axios.put(`${API_URL}/${userId}`, updatedData, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        console.error("❌ Error updating user profile:", error.response?.data || error.message);
        throw error;
    }
};

// ✅ Delete User Account
export const deleteUserAccount = async (userId) => {
    try {
        const response = await axios.delete(`${API_URL}/${userId}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        console.error("❌ Error deleting user account:", error.response?.data || error.message);
        throw error;
    }
};
