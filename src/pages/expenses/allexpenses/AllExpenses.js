import React, { useEffect, useState } from "react";
import { getGroupById } from "../../../services/GroupService";
import "./AllExpenses.css";
import { useExpenseContext } from "../../../context/ExpenseContext";

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
            const colorClass = `colorful-border-${index % 5}`;
            return (
              <div key={expense._id} className={`expense-card ${colorClass}`}>
                <h3>{expense.description}</h3>
                <p><strong>Amount:</strong> ₹{expense.amount}</p>
                <p><strong>Paid By:</strong> {expense.paidBy || "N/A"}</p>
                <p><strong>Group:</strong> {groupMap[expense.groupId] || "N/A"}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllExpenses;
