import axios from "axios";
import config from "../Config";
import { getAuthToken } from "../Config";

const API_URL = `${config.backendUrl}/transactions`;
const token = localStorage.getItem("authToken");

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`, 
};

// Record a new payment
// In TransactionService.js, modify the recordPayment function:
export const recordPayment = async (transactionData) => {
    const response = await axios.post(`${API_URL}/pay`, transactionData, {headers});
    return response.data;
  };

// Get all transactions for a specific user
export const getUserTransactions = async (userId) => {
  const response = await axios.get(`${API_URL}/user/${userId}`, { headers });
  return response.data;
};

// Get all transactions for a specific group
export const getGroupTransactions = async (groupId) => {
  const response = await axios.get(`${API_URL}/group/${groupId}`, { headers });
  return response.data;
};

// Get the balance for a specific user
export const getUserBalance = async (userId) => {
  const response = await axios.get(`${API_URL}/balance/${userId}`, { headers });
  return response.data;
};
