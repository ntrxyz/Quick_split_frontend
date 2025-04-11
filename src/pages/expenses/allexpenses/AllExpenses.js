import React, { useEffect, useState } from "react";
import { getExpensesByUser } from "../../../services/ExpenseService";
import { getGroupById } from "../../../services/GroupService";
import "./AllExpenses.css";

const AllExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupMap, setGroupMap] = useState({});

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await getExpensesByUser();
        setExpenses(data);

        // Extract unique group IDs
        const groupIds = [...new Set(data.map((exp) => exp.groupId))];

        // Fetch group names for each groupId
        const groupResponses = await Promise.all(
          groupIds.map((id) => getGroupById(id))
        );
        const map = {};
        groupResponses.forEach((group) => {
          map[group.id] = group.name;
        });
        setGroupMap(map);
      } catch (error) {
        console.error("Error fetching expenses or groups:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

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
            const colorClass = `colorful-border-${index % 5}`; // Rotate through 5 color styles
            return (
              <div key={expense._id} className={`expense-card ${colorClass}`}>
                <h3>{expense.description}</h3>
                <p>
                  <strong>Amount:</strong> ₹{expense.amount}
                </p>
                <p>
                  <strong>Paid By:</strong> {expense.paidBy || "N/A"}
                </p>
                <p>
                  <strong>Group:</strong> {groupMap[expense.groupId] || "N/A"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllExpenses;
