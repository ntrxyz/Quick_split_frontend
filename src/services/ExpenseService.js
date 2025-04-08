
import axios from "axios";
import config from "../Config";

const API_URL = `${config.backendUrl}/expenses`; // Base URL for Expense APIs

// ✅ Get Token from Local Storage
const getAuthHeader = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
        console.error("❌ No auth token found!");
        return {};
    }
    return { Authorization: `Bearer ${token}` };
};

// ✅ General API Request Handler
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

// ✅ Add a new Expense
export const addExpense = async (expenseData) => {
    return apiRequest("post", "", expenseData);
};

// ✅ Get Expense by ID
export const getExpenseById = async (expenseId) => {
    return apiRequest("get", `/${expenseId}`);
};

// ✅ Get Expenses by Group ID
export const getExpensesByGroup = async (groupId) => {
    return apiRequest("get", `/group/${groupId}`);
};

// ✅ Get Expenses by User ID
export const getExpensesByUser = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        console.error("❌ No userId found in localStorage!");
        return [];
    }
    return apiRequest("get", `/user/${userId}`);
};

// ✅ Update an Expense
export const updateExpense = async (expenseId, updatedExpense) => {
    return apiRequest("put", `/${expenseId}`, updatedExpense);
};

// ✅ Delete an Expense
export const deleteExpense = async (expenseId) => {
    return apiRequest("delete", `/${expenseId}`);
};
