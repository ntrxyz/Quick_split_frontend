import React, { createContext, useContext, useEffect, useState } from "react";
import { getExpensesByUser } from "../services/ExpenseService";

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      const data = await getExpensesByUser();
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses in context:", error);
    } finally {
      setLoading(false);
    }
  };

  // New function that updates the state by removing the deleted expense.
  const removeExpenseFromContext = (expenseId) => {
    setExpenses((prevExpenses) =>
      prevExpenses.filter(
        (exp) => exp._id !== expenseId && exp.id !== expenseId
      )
    );
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <ExpenseContext.Provider
      value={{ expenses, setExpenses, fetchExpenses, loading, removeExpenseFromContext }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenseContext = () => useContext(ExpenseContext);