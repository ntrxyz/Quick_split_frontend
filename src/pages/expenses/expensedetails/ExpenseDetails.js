import "./ExpenseDetails.css";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../../../services/ExpenseService";
import { getGroupById } from "../../../services/GroupService";
import { getUserProfile } from "../../../services/userService";
import { useExpenseContext } from "../../../context/ExpenseContext";
import { Pencil, Trash2 } from "lucide-react";

const ExpenseDetails = () => {
  const { expenseId } = useParams();
  const navigate = useNavigate();
  
  const { setExpenses, removeExpenseFromContext } = useExpenseContext();


  const [expense, setExpense] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: 0,
    paidBy: "",
    sharedWith: [],
  });

  // These states will hold the fetched user profiles.
  const [paidByUser, setPaidByUser] = useState(null);
  const [sharedWithUsers, setSharedWithUsers] = useState([]);

  useEffect(() => {
    const fetchExpenseDetails = async () => {
      try {
        const data = await getExpenseById(expenseId);
        if (!data) {
          setError("Expense not found");
          return;
        }

        setExpense(data);
        setFormData({
          description: data.description || "",
          amount: data.amount || 0,
          paidBy: data.paidBy || "",
          sharedWith: data.sharedWith || [],
        });

        if (data.groupId) {
          const groupData = await getGroupById(data.groupId);
          setGroup(groupData);
        }
      } catch (error) {
        setError("Failed to load expense details");
      } finally {
        setLoading(false);
      }
    };

    if (expenseId) fetchExpenseDetails();
    else {
      setError("No expense ID provided");
      setLoading(false);
    }
  }, [expenseId]);

  // After expense is loaded, fetch the user profiles for paidBy and sharedWith fields.
  useEffect(() => {
    const fetchUserNames = async () => {
      if (expense) {
        try {
          const payerProfile = await getUserProfile(expense.paidBy);
          setPaidByUser(payerProfile);
        } catch (e) {
          console.error("Error fetching paidBy user", e);
          setPaidByUser(null);
        }

        if (expense.sharedWith && expense.sharedWith.length > 0) {
          try {
            const profiles = await Promise.all(
              expense.sharedWith.map((userId) => getUserProfile(userId))
            );
            setSharedWithUsers(profiles.filter(Boolean));
          } catch (e) {
            console.error("Error fetching sharedWith users", e);
            setSharedWithUsers([]);
          }
        } else {
          setSharedWithUsers([]);
        }
      }
    };

    fetchUserNames();
  }, [expense]);

  const handleGoBack = () => navigate("/dashboard?tab=expenses");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSharedWithChange = (e) => {
    const emails = e.target.value.split(",").map((email) => email.trim());
    setFormData({ ...formData, sharedWith: emails });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = { ...formData, groupId: expense.groupId };
      const updatedExpense = await updateExpense(expenseId, updatedData);

      setExpense({ ...expense, ...updatedExpense });
      setExpenses((prev) =>
        prev.map((exp) =>
          exp._id === expenseId ? { ...exp, ...updatedExpense } : exp
        )
      );
      setIsEditing(false);
      alert("Expense updated successfully!");
    } catch (error) {
      alert("Failed to update expense.");
    }
  };

 

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(expenseId);
        // Remove expense from the context state using our helper function
        removeExpenseFromContext(expenseId);
        alert("Expense deleted!");
        navigate("/dashboard?tab=expenses");
      } catch (error) {
        alert("Failed to delete expense.");
      }
    }
  };

  if (loading) return <div>Loading expense details...</div>;
  if (error) return <div>{error}</div>;
  if (!expense) return <div>Expense not found.</div>;

  return (
    <div className="background-expense">
      <div className="expense-details-container">
        <div className="button-container">
          <button onClick={handleGoBack} className="back-button">
            &larr;
          </button>
          {!isEditing && (
            <div className="action-buttons">
              <Pencil
                className="icon-button edit-icon"
                onClick={() => setIsEditing(true)}
              />
              <Trash2
                className="icon-button delete-icon"
                onClick={handleDelete}
              />
            </div>
          )}
        </div>

        <h2>{isEditing ? "Edit Expense" : "Expense Details"}</h2>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="edit-form">
            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount (₹):</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="paidBy">Paid By:</label>
              <input
                type="text"
                id="paidBy"
                name="paidBy"
                value={formData.paidBy}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sharedWith">
                Shared With (comma-separated emails):
              </label>
              <textarea
                id="sharedWith"
                name="sharedWith"
                value={formData.sharedWith.join(", ")}
                onChange={handleSharedWithChange}
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="save-button">
                Save Changes
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="expense-box">
            <div className="expense-field">
              <strong>Description:</strong> {expense.description}
            </div>
            <div className="expense-field">
              <strong>Amount:</strong> ₹{expense.amount}
            </div>
            <div className="expense-field">
              <strong>Paid By:</strong>{" "}
              {paidByUser
                ? paidByUser.name || paidByUser.email
                : expense.paidBy}
            </div>
            <div className="expense-field">
              <strong>Group:</strong> {group?.name || "N/A"}
            </div>
            <div className="expense-field">
              <strong>Shared With:</strong>
              {sharedWithUsers.length ? (
                <ul>
                  {sharedWithUsers.map((user, idx) => (
                    <li key={idx}>
                      {user && (user.name || user.email)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No one</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseDetails;