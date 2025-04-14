// src/context/TransactionContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserTransactions } from "../services/TransactionService";

const TransactionContext = createContext();

export const useTransaction = () => useContext(TransactionContext);

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoadingTransactions(true);
        const data = await getUserTransactions(userId);
        setTransactions(data);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Could not load transactions.");
      } finally {
        setLoadingTransactions(false);
      }
    };

    if (userId) fetchTransactions();
  }, [userId]);

  return (
    <TransactionContext.Provider value={{ transactions, loadingTransactions, error }}>
      {children}
    </TransactionContext.Provider>
  );
};
