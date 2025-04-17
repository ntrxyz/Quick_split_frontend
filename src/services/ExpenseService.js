import axios from "axios";
import config from "../Config";

const API_URL = `${config.backendUrl}/expenses`; // e.g. "http://localhost:8080/api/expenses"

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
    console.error(
      `❌ API ${method.toUpperCase()} Error:`,
      error.response?.data || error.message
    );
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

// ✅ Get expenses from all groups the user belongs to
export const getAllUserRelatedExpenses = async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.error("❌ No userId found in localStorage!");
    return [];
  }

  try {
    // First, get all groups the user belongs to
    const userGroupsResponse = await axios({
      method: "get",
      url: `${config.backendUrl}/groups/user/${userId}`,
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    console.log("✅ User's groups fetched:", userGroupsResponse.data);

    // For each group, fetch all expenses
    const groupsExpensesPromises = userGroupsResponse.data.map((group) =>
      getExpensesByGroup(group._id || group.id)
    );

    // Also fetch the user's direct expenses
    groupsExpensesPromises.push(getExpensesByUser());

    // Wait for all requests to complete, then flatten and deduplicate results
    const allExpensesArrays = await Promise.all(groupsExpensesPromises);
    const allExpenses = allExpensesArrays.flat();
    const uniqueExpenses = [];
    const expenseIds = new Set();

    for (const expense of allExpenses) {
      const expenseId = expense._id || expense.id;
      if (expenseId && !expenseIds.has(String(expenseId))) {
        expenseIds.add(String(expenseId));
        uniqueExpenses.push(expense);
      }
    }

    console.log("✅ All unique user-related expenses:", uniqueExpenses);
    return uniqueExpenses;
  } catch (error) {
    console.error("❌ Error fetching all user expenses:", error);
    console.log("⚠️ Falling back to only user-created expenses");
    return getExpensesByUser();
  }
};

// ✅ Mark an Expense as Settled  
export const settleExpense = async (expenseId) => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    throw new Error("No userId found in localStorage");
  }
  if (!expenseId) {
    throw new Error("No expenseId provided to settleExpense");
  }
  
  console.log(`Sending settle request for expense ID: ${expenseId}, User ID: ${userId}`);
  
  try {
    const response = await axios({
      method: "patch",
      url: `${API_URL}/${expenseId}/settle/${userId}`,
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    console.log("✅ Expense marked as settled:", response.data);
    return response.data; // The API returns the updated expense with the updated 'settledBy' array
  } catch (error) {
    console.error(
      "❌ Error marking expense as settled:",
      error.response?.data || error.message
    );
    throw error;
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