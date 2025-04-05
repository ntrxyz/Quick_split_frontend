import axios from "axios";
import config from "../Config";

const API_URL = `${config.backendUrl}/users`; // Ensure correct API endpoint

// ✅ Get Token from Local Storage
const getAuthHeader = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
        console.warn("⚠️ No auth token found! API requests may fail.");
        return {};
    }
    return { Authorization: `Bearer ${token}` };
};

// ✅ Get User Profile
export const getUserProfile = async (userId) => {
    try {
        if (!userId) throw new Error("Invalid user ID provided!");
        
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
        if (!userId || !updatedData) throw new Error("User ID or data is missing!");

        const response = await axios.put(`${API_URL}/${userId}`, updatedData, {
            headers: getAuthHeader(),
        });

        console.log("✅ Profile Updated Successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error updating user profile:", error.response?.data || error.message);
        throw error;
    }
};

// ✅ Delete User Account
export const deleteUserAccount = async (userId) => {
    try {
        if (!userId) throw new Error("User ID is required for deletion!");

        const response = await axios.delete(`${API_URL}/${userId}`, {
            headers: getAuthHeader(),
        });

        console.log("✅ User Account Deleted Successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error deleting user account:", error.response?.data || error.message);
        throw error;
    }
};

// ✅ Get All Users (If needed)
export const getAllUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}`, {
            headers: getAuthHeader(),
        });

        console.log("✅ Fetched All Users:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching users:", error.response?.data || error.message);
        throw error;
    }
};
