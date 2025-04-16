import React, { useEffect, useState } from "react";
import { getGroupById } from "../../../services/GroupService";
import { getUserProfile } from "../../../services/userService";
import "./AllExpenses.css";
import { useExpenseContext } from "../../../context/ExpenseContext";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS

const AllExpenses = () => {
  const { expenses, loading } = useExpenseContext();
  const [groupMap, setGroupMap] = useState({});
  const [userMap, setUserMap] = useState({});
  const loggedInUserId = localStorage.getItem("userId"); // or you can get this from your Auth context

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
          map[group._id || group.id] = group.name;
        });
        setGroupMap(map);
       
      } catch (error) {
        console.error("Error fetching group names:", error);
        toast.error("Failed to load group data. Please try again.");
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
            exp.sharedWith.forEach((id) => id && uniqueUserIds.add(id));
          }
        });
        const userIds = Array.from(uniqueUserIds);
        const responses = await Promise.allSettled(
          userIds.map((id) => getUserProfile(id))
        );
        const map = {};
        responses.forEach((result) => {
          if (result.status === "fulfilled") {
            const user = result.value;
            map[user._id || user.id] = user.name || user.email;
          }
        });
        setUserMap(map);
        
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("Failed to load user data. Please try again.");
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
            const expenseId = expense.id || expense._id;
            if (!expenseId) {
              console.error("No ID found for expense:", expense);
              toast.error("Error: Invalid expense data encountered.");
              return null;
            }
            const colorClass = `colorful-border-${index % 5}`;
            return (
              <Link
                to={`/expenses/${expenseId}`}
                key={expenseId}
                className="expense-link"
              >
                <div className={`expense-card ${colorClass}`}>
                  {expense.paidBy === loggedInUserId ? (
                    <span className="settleup-badge tick">You paid</span>
                  ) : expense.settledBy?.includes(loggedInUserId) ? (
                    <span className="settleup-badge tick">Settled</span>
                  ) : (
                    <span className="settleup-badge">Settle Up</span>
                  )}

                  <h3>{expense.description}</h3>
                  <p>
                    <strong>Amount:</strong> ₹{expense.amount}
                  </p>
                  <p>
                    <strong>Paid By:</strong>{" "}
                    <span>
                      {userMap[expense.paidBy] || expense.paidBy || "N/A"}
                      {expense.settledBy &&
                        expense.settledBy.length > 0 && (
                          <span className="green-tick"> ✓</span>
                        )}
                    </span>
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

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AllExpenses;