import React, { useEffect, useState } from "react";
import { getGroupById } from "../../../services/GroupService";
import { getUserProfile } from "../../../services/userService";
import "./AllExpenses.css";
import { useExpenseContext } from "../../../context/ExpenseContext";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AllExpenses = () => {
  // Destructure settleExpenseInContext along with expenses and loading.
  const { expenses, loading, settleExpenseInContext } = useExpenseContext();
  const [groupMap, setGroupMap] = useState({});
  const [userMap, setUserMap] = useState({});
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const loggedInUserId = localStorage.getItem("userId")?.toString();

  // Fetch and map group IDs to names
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        // Get unique group IDs and ensure conversion to strings.
        const groupIds = [
          ...new Set(expenses.map(exp => exp.groupId && exp.groupId.toString()))
        ];
        const groupResponses = await Promise.all(
          groupIds.map(id => getGroupById(id))
        );
        const map = {};
        groupResponses.forEach(group => {
          map[String(group._id || group.id)] = group.name;
        });
        setGroupMap(map);
      } catch (error) {
        console.error("Error fetching group names:", error);
        toast.error("Failed to load group data. Please try again.");
      } finally {
        setGroupsLoading(false);
      }
    };

    if (expenses.length > 0) fetchGroups();
  }, [expenses]);

  // Fetch and map user IDs to names
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const uniqueUserIds = new Set();
        expenses.forEach(exp => {
          if (exp.paidBy) uniqueUserIds.add(exp.paidBy.toString());
          if (exp.sharedWith && Array.isArray(exp.sharedWith)) {
            exp.sharedWith.forEach(id => id && uniqueUserIds.add(id.toString()));
          }
        });
        const userIds = Array.from(uniqueUserIds);
        const responses = await Promise.allSettled(
          userIds.map(id => getUserProfile(id))
        );
        const map = {};
        responses.forEach(result => {
          if (result.status === "fulfilled") {
            const user = result.value;
            map[String(user._id || user.id)] = user.name || user.email;
          }
        });
        setUserMap(map);
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("Failed to load user data. Please try again.");
      } finally {
        setUsersLoading(false);
      }
    };

    if (expenses.length > 0) fetchUsers();
  }, [expenses]);

  // Utility: Check if the logged-in user has settled the expense.
  // Logs the settledBy array and the logged-in user ID for debugging.
  const isSettledByUser = (expense) => {
    if (!Array.isArray(expense.settledBy)) return false;
    const settledIds = expense.settledBy.map(id => id.toString());
    console.log("Expense:", expense.description, "| settledBy:", settledIds, "| loggedInUserId:", loggedInUserId);
    return settledIds.includes(loggedInUserId);
  };

  return (
    <div className="expenses-container">
      <h2>Your Expenses</h2>
      {loading || groupsLoading || usersLoading ? (
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
            const userSettled = isSettledByUser(expense);
            const isPaidBy = expense.paidBy && expense.paidBy.toString() === loggedInUserId;

            return (
              <Link to={`/expenses/${expenseId}`} key={expenseId} className="expense-link">
                <div className={`expense-card ${colorClass}`}>
                  {isPaidBy ? (
                    <span className="settleup-badge tick">You paid</span>
                  ) : userSettled ? (
                    <span className="settleup-badge tick">Settled</span>
                  ) : (
                    <span
                      className="settleup-badge clickable"
                      onClick={(e) => {
                        // Prevent navigation when clicking the settle badge.
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Settle Up clicked for expense id:", expenseId);
                        settleExpenseInContext(expenseId)
                          .then(() => toast.success("Expense settled!"))
                          .catch(err => {
                            console.error("Error settling expense:", err);
                            toast.error("Failed to settle expense.");
                          });
                      }}
                    >
                      Settle Up
                    </span>
                  )}

                  <h3>{expense.description}</h3>
                  <p>
                    <strong>Amount:</strong> ₹{expense.amount}
                  </p>
                  <p>
                    <strong>Paid By:</strong>{" "}
                    <span>
                      {userMap[String(expense.paidBy)] || expense.paidBy || "N/A"}
                      {userSettled && <span className="green-tick"> ✓</span>}
                    </span>
                  </p>
                  <p>
                    <strong>Group:</strong> {groupMap[String(expense.groupId)] || "N/A"}
                  </p>
                  <p>
                    <strong>Shared With:</strong>{" "}
                    {expense.sharedWith && expense.sharedWith.length > 0
                      ? expense.sharedWith.map(id => userMap[String(id)] || id).join(", ")
                      : "None"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default AllExpenses;