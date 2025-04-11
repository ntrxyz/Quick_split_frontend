import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getGroupById, removeUserFromGroup } from "../../services/GroupService";
import { getUserProfile } from "../../services/userService";
import { getExpensesByGroup } from "../../services/ExpenseService";
import "./GroupDetails.css";

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [memberDetails, setMemberDetails] = useState([]);
  const [groupExpenses, setGroupExpenses] = useState([]);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const data = await getGroupById(id);
        setGroup(data);

        const users = await Promise.all(
          data.members.map((userId) => getUserProfile(userId))
        );
        setMemberDetails(users);

        const expenses = await getExpensesByGroup(id);
        setGroupExpenses(expenses);
      } catch (error) {
        console.error("❌ Failed to load group details:", error);
        alert("Group not found.");
        navigate("/groups");
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [id, navigate]);

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this user?")) return;
    try {
      await removeUserFromGroup(group.id, userId);
      setMemberDetails((prev) => prev.filter((m) => m.id !== userId));
    } catch (error) {
      console.error("❌ Failed to remove user:", error);
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
      <div className="group-details-card">
        <h1 className="group-title">📌 {group.name.toUpperCase()}</h1>
        
        {/* Members Section */}
        <div className="group-section">
          <h2>👥 Members</h2>
          <ul className="member-list">
            {memberDetails.length > 0 ? (
              memberDetails.map((member) => (
                <li key={member.id} className="member-item">
                  <div className="member-info">
                    <span className="member-username">
                      <i className="icon">👤</i>
                      {member.name}
                    </span>
                    <span className="member-email">
                      <i className="icon">📧</i>
                      {member.email}
                    </span>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    ❌ Remove
                  </button>
                </li>
              ))
            ) : (
              <p>No members in this group.</p>
            )}
          </ul>
        </div>

        {/* Expenses Section */}
        <div className="group-section">
          <h2>💰 Group Expenses</h2>
          {groupExpenses.length === 0 ? (
            <p>No expenses found for this group.</p>
          ) : (
            <div className="expenses-grid">
              {groupExpenses.map((expense) => {
                // Make sure we have an ID to work with
                const expenseId = expense._id || expense.id;
                
                return (
                  <div 
                    key={expenseId} 
                    className="expense-card clickable-card"
                    onClick={() => handleExpenseClick(expenseId)}
                  >
                    <h3 className="expense-title">{expense.description}</h3>
                    <p className="expense-amount">₹{expense.amount}</p>
                    <p className="expense-paid-by">
                      Paid By: <strong>{expense.paidBy}</strong>
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;