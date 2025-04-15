import React, { createContext, useContext, useEffect, useState } from "react";
import { getExpensesByUser, getAllUserRelatedExpenses } from "../services/ExpenseService";

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const loggedInUserId = localStorage.getItem("userId");

  const fetchExpenses = async () => {
    try {
      console.log("Fetching all user-related expenses...");
      
      // Try to fetch all expenses related to the user through groups
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
      
      // Filter expenses to ensure user is involved (either payer or participant)
      const userRelatedExpenses = allExpenses.filter(expense => {
        const isPayer = expense.paidBy === loggedInUserId;
        const isParticipant = Array.isArray(expense.sharedWith) && 
                             expense.sharedWith.includes(loggedInUserId);
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

  // Function to remove an expense from the context by ID
  const removeExpenseFromContext = (expenseId) => {
    setExpenses((prevExpenses) =>
      prevExpenses.filter(
        (exp) => exp._id !== expenseId && exp.id !== expenseId
      )
    );
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
        removeExpenseFromContext,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenseContext = () => useContext(ExpenseContext);