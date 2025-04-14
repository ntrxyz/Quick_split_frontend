import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGroupById, removeUserFromGroup } from "../../services/GroupService";
import { getUserProfile } from "../../services/userService";
import { getExpensesByGroup } from "../../services/ExpenseService";
import { getGroupTransactions } from "../../services/TransactionService";
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

        // Fetch member profiles; this returns an array of user objects.
        const members = await Promise.all(
          data.members.map((userId) => getUserProfile(userId))
        );
        setMemberDetails(members);

        // Fetch group expenses.
        const expenses = await getExpensesByGroup(id);
        setGroupExpenses(expenses);

        // Fetch group transactions.
        const transactions = await getGroupTransactions(id);
        setGroupTransactions(transactions);
      } catch (error) {
        console.error("Failed to load group details:", error);
        alert("Group not found, redirecting to groups list.");
        navigate("/groups");
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [id, navigate]);

  // Create a mapping from user id to member details (for easy lookup).
  const memberMap = {};
  memberDetails.forEach(member => {
    const userId = member.id || member._id;
    if (userId) {
      memberMap[userId] = member;
    }
  });

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this user?")) return;
    try {
      await removeUserFromGroup(group.id, userId);
      setMemberDetails((prev) => prev.filter((m) => (m.id || m._id) !== userId));
    } catch (error) {
      console.error("Failed to remove user:", error);
      alert("Failed to remove user from group.");
    }
  };

  const handleExpenseClick = (expenseId) => {
    navigate(`/expenses/${expenseId}`);
  };

  if (loading)
    return <div className="group-loading">Loading group details...</div>;
  if (!group) return <div className="group-not-found">Group not found.</div>;

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
                  <h3 className="transaction-title">Txn : </h3>
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
    </div>
  );
};

export default GroupDetails;