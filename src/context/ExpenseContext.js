import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getExpensesByUser,
  getAllUserRelatedExpenses,
  settleExpense,
} from "../services/ExpenseService";

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const loggedInUserId = localStorage.getItem("userId");

  const fetchExpenses = async () => {
    try {
      console.log("Fetching all user-related expenses...");

      // Attempt to fetch all expenses related to the user through groups
      let allExpenses = [];
      try {
        allExpenses = await getAllUserRelatedExpenses();
        console.log("Fetched all user-related expenses:", allExpenses);
      } catch (error) {
        console.error("Error fetching all user-related expenses, falling back:", error);
        // Fallback to just user expenses if the comprehensive fetch fails
        allExpenses = await getExpensesByUser();
        console.log("Fetched user expenses (fallback):", allExpenses);
      }

      // Filter expenses to ensure the user is involved (either payer or participant)
      // Also, mark if the current user has settled this expense based on the 'settledBy' array.
      const userRelatedExpenses = allExpenses.filter(expense => {
        const isPayer = String(expense.paidBy) === String(loggedInUserId);
        const isParticipant =
          Array.isArray(expense.sharedWith) &&
          expense.sharedWith.some(id => String(id) === String(loggedInUserId));
        return isPayer || isParticipant;
      });

      console.log("Final filtered user expenses:", userRelatedExpenses);
      setExpenses(userRelatedExpenses);
    } catch (error) {
      console.error("Error fetching expenses in context:", error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to mark an expense as settled in context. This updates the expense
  // with the response from the API, which includes the updated 'settledBy' array.
  const settleExpenseInContext = async (expenseId) => {
    try {
      console.log(`Attempting to settle expense ID: ${expenseId}`);
      const updatedExpense = await settleExpense(expenseId);
      console.log("API returned updated expense:", updatedExpense);
      
      // Update expenses with the new settled expense
      setExpenses(prevExpenses => 
        prevExpenses.map(expense => {
          const currentExpenseId = String(expense._id || expense.id);
          const updatedExpenseId = String(updatedExpense._id || updatedExpense.id);
          
          return currentExpenseId === updatedExpenseId ? updatedExpense : expense;
        })
      );
      
      console.log(`✅ Expense ${expenseId} settled successfully in context.`);
      return updatedExpense;
    } catch (error) {
      console.error("❌ Error settling expense in context:", error);
      throw error;
    }
  };

  // Fetch expenses once on initial render
  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        setExpenses,
        fetchExpenses,
        loading,
        settleExpenseInContext, // Expose the settlement function
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenseContext = () => useContext(ExpenseContext);