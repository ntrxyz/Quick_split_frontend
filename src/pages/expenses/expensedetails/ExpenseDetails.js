import "./ExpenseDetails.css";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, navigate } from "react-router-dom";
import {
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../../../services/ExpenseService";
import { getGroupById } from "../../../services/GroupService";
import { getUserProfile } from "../../../services/userService";
import { useExpenseContext } from "../../../context/ExpenseContext";
import { Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import config from "../../../Config";
import { loadStripe } from "@stripe/stripe-js";
import { recordPayment } from "../../../services/TransactionService";


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

  

  const handleSettleUp = async () => {
  try {
    const currentUser = localStorage.getItem("userId");

    if (!expense || !expense.amount || expense.amount <= 0) {
      alert("Invalid expense details or amount.");
      return;
    }

    // If the current user is the payer, they typically wouldn't settle up their own expense.
    if (expense.paidBy === currentUser) {
      alert("You are the payer for this expense; you don't need to pay your own amount.");
      return;
    }

    // Ensure that the current user is part of the expense's participants
    if (!expense.sharedWith || !expense.sharedWith.includes(currentUser)) {
      alert("You are not a participant in this expense.");
      return;
    }

    // Calculate the user's share from the expense.
    const shareExact = parseFloat(expense.amount) / expense.sharedWith.length;
    const amountToPay = Math.round(shareExact);
    console.log("Current user's share amount (in rupees):", amountToPay);

    // Store payment details in localStorage for retrieval after payment
    localStorage.setItem("pendingPayment", JSON.stringify({
      expenseId: expenseId,
      payeeId: expense.paidBy,
      amount: amountToPay,
      groupId: expense.groupId,
      timestamp: new Date().toISOString()
    }));

    // Prepare form data with the computed share amount.
    const formData = new URLSearchParams();
    formData.append("amount", amountToPay.toString());

    // Construct the request URL
    const url = `${config.backendUrl}/stripe/create-checkout-session`;

    // POST the data to the backend.
    const response = await axios.post(url, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // Initialize Stripe using your public key from the .env file.
    const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
    if (!stripe) {
      throw new Error("Stripe failed to load.");
    }
    
    const sessionId = response.data.id;

    // Redirect to Stripe Checkout.
    const result = await stripe.redirectToCheckout({ sessionId });
    if (result.error) {
      console.error("Stripe Checkout error:", result.error.message);
      alert("Failed to redirect to Stripe Checkout: " + result.error.message);
    }
  } catch (error) {
    console.error("Settle Up error:", error.response?.data || error.message);
    alert("An error occurred while settling up. Please try again later.");
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

  const handleCashPayment = async () => {
    try {
      const currentUser = localStorage.getItem("userId");
  
      if (!expense || !expense.amount || expense.amount <= 0) {
        alert("Invalid expense details or amount.");
        return;
      }
  
      if (expense.paidBy === currentUser) {
        alert("You don't need to pay yourself.");
        return;
      }
  
      if (!expense.sharedWith || !expense.sharedWith.includes(currentUser)) {
        alert("You are not a participant in this expense.");
        return;
      }
  
      const shareExact = parseFloat(expense.amount) / expense.sharedWith.length;
      const amountToPay = Math.round(shareExact);
  
      const confirm = window.confirm(`Confirm cash payment of ₹${amountToPay} to ${paidByUser?.name || 'payer'}?`);
      if (!confirm) return;
  
      const transactionData = {
        payerId: currentUser,
        payeeId: expense.paidBy,
        amount: amountToPay,
        groupId: expense.groupId,
        expenseId: expenseId,
        method: "cash",
      };
  
      await recordPayment(transactionData);
      navigate("/dashboard?tab=transactions");
  
      // Optional: if one payment settles the whole transaction, update UI here
      // e.g. mark expense as settled or disable buttons
    } catch (error) {
      console.error("Error recording cash payment:", error);
      alert("Failed to record cash payment.");
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

            {!isEditing && !expense.isSettled && (
              <div>
  <button onClick={handleSettleUp} className="settle-up-button mx-4">
    Settle Up
  </button>

<button onClick={handleCashPayment} className="cash-payment-button">
Record Cash Payment
</button>
</div>
)}


          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseDetails;