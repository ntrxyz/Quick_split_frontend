import axios from "axios";
import config from "../Config";

const API_URL = `${config.backendUrl}/groups`;

// ✅ Get Token from Local Storage
const getAuthHeader = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
        console.error("❌ No auth token found!");
        return {};
    }
    return { Authorization: `Bearer ${token}` };
};

// ✅ General API Request Function (Handles Auth Automatically)
const apiRequest = async (method, url, data = null) => {
    try {
        const response = await axios({
            method,
            url: `${API_URL}${url}`,
            data,
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader(),
            },
        });
        console.log(`✅ ${method.toUpperCase()} Request Success:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`❌ API ${method.toUpperCase()} Error:`, error.response?.data || error.message);
        throw error;
    }
};

// ✅ Create Group (Logged-in user is added automatically)
export const createGroup = async (name) => {
    return apiRequest("post", `?name=${encodeURIComponent(name)}`);
};

// ✅ Get Group by ID
export const getGroupById = async (groupId) => {
    return apiRequest("get", `/${groupId}`);
};

// ✅ Get Logged-in User's Groups
export const getUserGroups = async () => {
    const userId = localStorage.getItem("userId"); // 👈 Get userId from localStorage
    if (!userId) {
        console.error("❌ No userId found in localStorage!");
        return [];
    }
    return apiRequest("get", `/user/${userId}`); // 👈 Pass userId in the URL
};


// ✅ Add User to Group
export const addUserToGroup = async (groupId, userId) => {
    return apiRequest("post", `/${groupId}/add-user/${userId}`);
};

// ✅ Remove User from Group
export const removeUserFromGroup = async (groupId, userId) => {
    return apiRequest("delete", `/${groupId}/remove-user/${userId}`);
};

// ✅ Delete Group
export const deleteGroup = async (groupId) => {
    return apiRequest("delete", `/${groupId}`);
};