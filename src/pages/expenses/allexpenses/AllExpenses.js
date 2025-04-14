import React, { useEffect, useState } from "react";
import { getGroupById } from "../../../services/GroupService";
import { getUserProfile } from "../../../services/userService";
import "./AllExpenses.css";
import { useExpenseContext } from "../../../context/ExpenseContext";
import { Link } from "react-router-dom";

const AllExpenses = () => {
  const { expenses, loading } = useExpenseContext();
  const [groupMap, setGroupMap] = useState({});
  const [userMap, setUserMap] = useState({});

  // Fetch groups and map group IDs to group names.
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groupIds = [...new Set(expenses.map((exp) => exp.groupId))];
        const groupResponses = await Promise.all(
          groupIds.map((id) => getGroupById(id))
        );

        const map = {};
        groupResponses.forEach((group) => {
          // Use _id or id depending on the object structure.
          map[group._id || group.id] = group.name;
        });
        setGroupMap(map);
      } catch (error) {
        console.error("Error fetching group names:", error);
      }
    };

    if (expenses.length > 0) fetchGroups();
  }, [expenses]);

  // Fetch user details for all unique user IDs across expenses.
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const uniqueUserIds = new Set();
        expenses.forEach((exp) => {
          if (exp.paidBy) uniqueUserIds.add(exp.paidBy);
          if (exp.sharedWith && Array.isArray(exp.sharedWith)) {
            exp.sharedWith.forEach((id) => {
              if (id) uniqueUserIds.add(id);
            });
          }
        });

        const userIds = Array.from(uniqueUserIds);
        // Using Promise.allSettled so one failure doesn't fail the whole mapping
        const responses = await Promise.allSettled(
          userIds.map((id) => getUserProfile(id))
        );
        const map = {};
        responses.forEach((result) => {
          if (result.status === "fulfilled") {
            const user = result.value;
            // Map user ID to a display name (using user.name if available; fallback to email)
            map[user._id || user.id] = user.name || user.email;
          }
        });
        setUserMap(map);
      } catch (e) {
        console.error("Error fetching user details:", e);
      }
    };

    if (expenses.length > 0) fetchUsers();
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
            // Check for id or _id — databases might use either.
            const expenseId = expense.id || expense._id;
            if (!expenseId) {
              console.error("No ID found for expense:", expense);
              return null; // Skip rendering if no ID exists.
            }
            const colorClass = `colorful-border-${index % 5}`;
            return (
              <Link
                to={`/expenses/${expenseId}`}
                key={expenseId}
                className="expense-link"
              >
                <div className={`expense-card ${colorClass}`}>
                  {/* Badge for settling the expense (visible if not settled) */}
                  {(!expense.isSettled || expense.isSettled === false) && (
                    <span className="settleup-badge">Settle Up</span>
                  )}
                  <h3>{expense.description}</h3>
                  <p>
                    <strong>Amount:</strong> ₹{expense.amount}
                  </p>
                  <p>
                    <strong>Paid By:</strong>{" "}
                    {userMap[expense.paidBy] || expense.paidBy || "N/A"}
                  </p>
                  <p>
                    <strong>Group:</strong> {groupMap[expense.groupId] || "N/A"}
                  </p>
                  <p>
                    <strong>Shared With:</strong>{" "}
                    {expense.sharedWith && expense.sharedWith.length > 0
                      ? expense.sharedWith
                          .map((id) => userMap[id] || id)
                          .join(", ")
                      : "None"}
                  </p>
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