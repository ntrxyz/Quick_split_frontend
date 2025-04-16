import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGroupById, removeUserFromGroup } from "../../services/GroupService";
import { getUserProfile } from "../../services/userService";
import { getExpensesByGroup } from "../../services/ExpenseService";
import { getGroupTransactions } from "../../services/TransactionService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./GroupDetails.css";

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [memberDetails, setMemberDetails] = useState([]);
  const [groupExpenses, setGroupExpenses] = useState([]);
  const [groupTransactions, setGroupTransactions] = useState([]);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        // Fetch basic group details
        const data = await getGroupById(id);
        setGroup(data);

        // Fetch member profiles (returns an array of user objects)
        const members = await Promise.all(
          data.members.map((userId) => getUserProfile(userId))
        );
        setMemberDetails(members);

        // Fetch group expenses
        const expenses = await getExpensesByGroup(id);
        setGroupExpenses(expenses);

        // Fetch group transactions
        const transactions = await getGroupTransactions(id);
        setGroupTransactions(transactions);

        toast.success("✅ Group details loaded successfully!");
      } catch (error) {
        console.error("Failed to load group details:", error);
        toast.error("❌ Group not found, redirecting to groups list.");
        navigate("/groups");
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [id, navigate]);

  // Create a map of userId to member details for quick lookup
  const memberMap = {};
  memberDetails.forEach((member) => {
    const userId = member.id || member._id;
    if (userId) {
      memberMap[userId] = member;
    }
  });

  // Remove member using a custom toast with buttons for confirmation
  const handleRemoveMember = (userId) => {
    toast(
      ({ closeToast }) => (
        <div>
          <p>Are you sure you want to remove this user?</p>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              style={{
                backgroundColor: "#4caf50",
                border: "none",
                color: "white",
                padding: "5px 10px",
                cursor: "pointer",
              }}
              onClick={async () => {
                try {
                  await removeUserFromGroup(group.id, userId);
                  setMemberDetails((prev) =>
                    prev.filter((m) => (m.id || m._id) !== userId)
                  );
                  toast.success("✅ User removed from group successfully!");
                } catch (error) {
                  console.error("Failed to remove user:", error);
                  toast.error("❌ Failed to remove user from group.");
                } finally {
                  closeToast();
                }
              }}
            >
              Confirm
            </button>
            <button
              style={{
                backgroundColor: "#f44336",
                border: "none",
                color: "white",
                padding: "5px 10px",
                cursor: "pointer",
              }}
              onClick={closeToast}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        position: "top-right",
        autoClose: false, // The toast will remain until one of the buttons is clicked
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  const handleExpenseClick = (expenseId) => {
    navigate(`/expenses/${expenseId}`);
  };

  if (loading) {
    return <div className="group-loading">Loading group details...</div>;
  }

  if (!group) {
    return <div className="group-not-found">Group not found.</div>;
  }

  return (
    <div className="group-details-bg">
      <div className="group-details-container">
        {/* Main Group Details (Members & Expenses) */}
        <div className="group-details-card">
          <h1 className="group-title">📌 {group.name.toUpperCase()}</h1>

          {/* Members Section */}
          <div className="group-section">
            <h2>👥 Members</h2>
            <ul className="member-list">
              {memberDetails.length > 0 ? (
                memberDetails.map((member) => {
                  const memberId = member.id || member._id;
                  return (
                    <li key={memberId} className="member-item">
                      <div className="member-info">
                        <span className="member-username">
                          <i className="icon">👤</i> {member.name}
                        </span>
                        <span className="member-email">
                          <i className="icon">📧</i> {member.email}
                        </span>
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveMember(memberId)}
                      >
                        ❌ Remove
                      </button>
                    </li>
                  );
                })
              ) : (
                <p>No members in this group.</p>
              )}
            </ul>
          </div>

          {/* Expenses Section */}
          <div className="group-section">
            <h2>💰 Group Expenses</h2>
            {groupExpenses.length === 0 ? (
              <p>No expenses recorded in this group.</p>
            ) : (
              <div className="expenses-grid">
                {groupExpenses.map((expense) => {
                  const expenseId = expense._id || expense.id;
                  const payerName = memberMap[expense.paidBy]
                    ? memberMap[expense.paidBy].name
                    : expense.paidBy;
                  const sharedNames =
                    expense.sharedWith && expense.sharedWith.length > 0
                      ? expense.sharedWith
                          .map((uid) =>
                            memberMap[uid] ? memberMap[uid].name : uid
                          )
                          .join(", ")
                      : "None";
                  return (
                    <div
                      key={expenseId}
                      className="expense-card clickable-card"
                      onClick={() => handleExpenseClick(expenseId)}
                    >
                      <h3 className="expense-title">{expense.description}</h3>
                      <p className="expense-amount">₹{expense.amount}</p>
                      <p className="expense-paid-by">
                        Paid By: <strong>{payerName}</strong>
                      </p>
                      <p className="expense-shared-with">
                        Shared With: <strong>{sharedNames}</strong>
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Transactions Sidebar */}
        <div className="transactions-sidebar">
          <h2>💸 Transactions</h2>
          {groupTransactions.length === 0 ? (
            <p>No transactions available.</p>
          ) : (
            groupTransactions.map((tx) => {
              const txId = tx.id || tx._id;
              const payerName = memberMap[tx.payerId]
                ? memberMap[tx.payerId].name
                : tx.payerId;
              const payeeName = memberMap[tx.payeeId]
                ? memberMap[tx.payeeId].name
                : tx.payeeId;
              return (
                <div key={txId} className="transaction-card">
                  <h3 className="transaction-title">Txn :</h3>
                  <p>
                    <strong>Amount:</strong> ₹{tx.amount}
                  </p>
                  <p>
                    <strong>Payer:</strong> {payerName}
                  </p>
                  <p>
                    <strong>Payee:</strong> {payeeName}
                  </p>
                  <p className="transaction-time">
                    <strong>Time:</strong> {new Date(tx.timestamp).toLocaleString()}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default GroupDetails;