import axios from "axios";

const API_URL = "http://localhost:8080/api/users";

// Get Token from Local Storage
const getAuthHeader = () => {
  const token = localStorage.getItem("userToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get User Profile
export const getUserProfile = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/${userId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Update User Profile
export const updateUserProfile = async (userId, updatedData) => {
  try {
    const response = await axios.put(`${API_URL}/${userId}`, updatedData, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Delete User Account
export const deleteUserAccount = async (userId) => {
  try {
    const response = await axios.delete(`${API_URL}/${userId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw error;
  }
};
