// AllExpenses.jsx - Updated version
import React, { useEffect, useState } from "react";
import { getGroupById } from "../../../services/GroupService";
import "./AllExpenses.css";
import { useExpenseContext } from "../../../context/ExpenseContext";
import { Link } from "react-router-dom";

const AllExpenses = () => {
  const { expenses, loading } = useExpenseContext();
  const [groupMap, setGroupMap] = useState({});
  
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groupIds = [...new Set(expenses.map((exp) => exp.groupId))];
        const groupResponses = await Promise.all(
          groupIds.map((id) => getGroupById(id))
        );
        const map = {};
        groupResponses.forEach((group) => {
          map[group.id] = group.name;
        });
        setGroupMap(map);
      } catch (error) {
        console.error("Error fetching group names:", error);
      }
    };
    
    if (expenses.length > 0) fetchGroups();
  }, [expenses]);
  
  return (
    <div className="expenses-container">
      <h2>Your Expenses</h2>
      {loading ? (
        <p>Loading expenses...</p>
      ) : expenses.length === 0 ? (
        <p>No expenses found.</p>
      ) : (
        <div className="expenses-grid">
          {expenses.map((expense, index) => {
            console.log("Expense:", expense); // Log the full expense object to see its structure
            
            // Check for id or _id - databases often use either format
            const expenseId = expense.id || expense._id;
            console.log("Expense ID:", expenseId);
            
            if (!expenseId) {
              console.error("No ID found for expense:", expense);
              return null; // Skip rendering this expense if no ID found
            }
            
            const colorClass = `colorful-border-${index % 5}`;
            return (
              <Link
                to={`/expenses/${expenseId}`}
                key={expenseId}
                className="expense-link"
              >
                <div className={`expense-card ${colorClass}`}>
                  <h3>{expense.description}</h3>
                  <p><strong>Amount:</strong> ₹{expense.amount}</p>
                  <p><strong>Paid By:</strong> {expense.paidBy || "N/A"}</p>
                  <p><strong>Group:</strong> {groupMap[expense.groupId] || "N/A"}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllExpenses;