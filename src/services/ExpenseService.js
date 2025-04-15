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

// ✅ NEW: Get expenses from all groups the user belongs to
export const getAllUserRelatedExpenses = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        console.error("❌ No userId found in localStorage!");
        return [];
    }
    
    try {
        // First get all groups the user belongs to
        const userGroups = await axios({
            method: 'get',
            url: `${config.backendUrl}/groups/user/${userId}`,
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader(),
            },
        });
        
        console.log("✅ User's groups fetched:", userGroups.data);
        
        // For each group, fetch all expenses
        const groupsExpensesPromises = userGroups.data.map(group => 
            getExpensesByGroup(group._id || group.id)
        );
        
        // Also fetch the user's direct expenses
        groupsExpensesPromises.push(getExpensesByUser());
        
        // Wait for all requests to complete
        const allExpensesArrays = await Promise.all(groupsExpensesPromises);
        
        // Flatten and deduplicate the expenses
        const allExpenses = allExpensesArrays.flat();
        const uniqueExpenses = [];
        const expenseIds = new Set();
        
        for (const expense of allExpenses) {
            const expenseId = expense._id || expense.id;
            if (!expenseIds.has(expenseId)) {
                expenseIds.add(expenseId);
                uniqueExpenses.push(expense);
            }
        }
        
        console.log("✅ All unique user-related expenses:", uniqueExpenses);
        return uniqueExpenses;
    } catch (error) {
        console.error("❌ Error fetching all user expenses:", error);
        // Fall back to just user expenses
        console.log("⚠️ Falling back to only user-created expenses");
        return getExpensesByUser();
    }
};

// ✅ Update an Expense
export const updateExpense = async (expenseId, updatedExpense) => {
    return apiRequest("put", `/${expenseId}`, updatedExpense);
};

// ✅ Delete an Expense
export const deleteExpense = async (expenseId) => {
    return apiRequest("delete", `/${expenseId}`);
};