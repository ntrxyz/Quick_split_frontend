import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import profile from "../../assets/user.png";
import logout from "../../assets/logout.png";
import Profile from "../profile/Profile";
import Report from "../report/Report";
import Groups from "../groups/Groups";
import AddUserToAGroup from "../groups/AddUserToAGroup";
import Sidebar from "../../components/sidebar/Sidebar";
import AddExpense from "../expenses/addexpense/AddExpense";
import AllExpenses from "../expenses/allexpenses/AllExpenses";
import AllTransactions from "../transactions/alltransactions/AllTransactions";
import { useExpenseContext } from "../../context/ExpenseContext";
import { useTransaction } from "../../context/TransactionContext";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import config from "../../Config";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "dashboard";

  const [activeTab, setActiveTab] = useState(initialTab);
  const { expenses, loading } = useExpenseContext();
  const { transactions, loadingTransactions } = useTransaction();

  // Get current user ID
  const currentUser = localStorage.getItem("userId");

  // Expense-related calculations
  let totalOwedToMeExpense = 0; // Money others owe you (from expenses you paid)
  let totalIOweExpense = 0;     // Money you owe (for expenses you didn’t pay)

  expenses.forEach((exp) => {
    // Assuming exp.sharedWith is an array of user IDs excluding the payer
    const numParticipants = exp.sharedWith ? exp.sharedWith.length + 1 : 1;
    const share = parseFloat(exp.amount) / numParticipants;
    if (exp.paidBy === currentUser) {
      totalOwedToMeExpense += (parseFloat(exp.amount) - share);
    } else if (exp.sharedWith && exp.sharedWith.includes(currentUser)) {
      totalIOweExpense += share;
    }
  });

  // Transaction-related calculations
  let transactionsNet = 0; // Settled amount offset via payments
  if (transactions && transactions.length > 0) {
    transactions.forEach((tx) => {
      if (tx.payeeId === currentUser) {
        // Money you received through settlements reduces what is still owed to you.
        transactionsNet += Number(tx.amount);
      }
      if (tx.payerId === currentUser) {
        // Money you paid out reduces what you owe.
        transactionsNet -= Number(tx.amount);
      }
    });
  }

  // Final net outstanding balance calculation
  const expenseNet = totalOwedToMeExpense - totalIOweExpense; // Outstanding from expenses alone
  const finalNetBalance = expenseNet - transactionsNet;
  // Note: Positive finalNetBalance means others owe you money.
  // Negative finalNetBalance means you owe money.

  const handleSettleUp = async () => {
    const amount = 1000; // You can adjust this or calculate dynamically as needed.
    try {
      // Create x-www-form-urlencoded data
      const formData = new URLSearchParams();
      formData.append("amount", amount.toString());

      const response = await axios.post(
        `${config.backendUrl}/stripe/create-checkout-session`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
      if (!stripe) throw new Error("Stripe failed to load.");
      const sessionId = response.data.id;
      const result = await stripe.redirectToCheckout({ sessionId });
      if (result.error) {
        console.error("Stripe Checkout error:", result.error.message);
      }
    } catch (error) {
      console.error("Stripe checkout error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="dashboard">
        <header>
          <h2 onClick={() => setActiveTab("dashboard")}>Dashboard</h2>
          <div>
            <img
              src={profile}
              alt="Profile"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                cursor: "pointer",
                marginRight: "10px",
                border: "2px solid #ddd",
                objectFit: "cover",
              }}
            />
            <button
              className="btn btn-dark dropdown-toggle mx-2"
              type="button"
              data-bs-toggle="dropdown"
            >
              User
            </button>
            <ul className="dropdown-menu">
              <li>
                <button className="dropdown-item" onClick={() => setActiveTab("profile")}>
                  Profile
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
            <button className="add-expense mx-2" onClick={() => setActiveTab("add-expense")}>
              Add an Expense
            </button>
            <button className="settle-up mx-2" onClick={handleSettleUp}>
              Settle Up
            </button>
            <img
              src={logout}
              alt="Logout"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                cursor: "pointer",
                marginRight: "10px",
                border: "2px solid #ddd",
                objectFit: "cover",
              }}
              onClick={handleLogout}
            />
          </div>
        </header>

        {activeTab === "dashboard" && (
          <div>
            <div className="balance-summary my-3">
              {(loading || loadingTransactions) ? (
                <p>Calculating balance, please wait...</p>
              ) : (
                <>
                  <p>
                    Total Balance:{" "}
                    <span className={finalNetBalance >= 0 ? "positive" : "negative"}>
                      ₹{finalNetBalance.toFixed(2)}
                    </span>
                  </p>
                  <p>
                    You Owe:{" "}
                    <span className="neutral">
                      ₹{totalIOweExpense.toFixed(2)}
                    </span>
                  </p>
                  <p>
                    You Are Owed:{" "}
                    <span className="positive">
                      ₹{totalOwedToMeExpense.toFixed(2)}
                    </span>
                  </p>
                  {/* Show a note that transactions have been applied */}
                  <p className="transactions-note">
                    (Settlements of ₹{transactionsNet.toFixed(2)} applied)
                  </p>
                </>
              )}
            </div>
            <div>
              <AllExpenses />
            </div>
          </div>
        )}

        {activeTab === "transactions" && <AllTransactions />}
        {activeTab === "profile" && <Profile />}
        {activeTab === "reports" && <Report />}
        {activeTab === "groups" && <Groups />}
        {activeTab === "expenses" && <AllExpenses />}
        {activeTab === "add user to group" && <AddUserToAGroup />}
        {activeTab === "add-expense" && <AddExpense />}
      </main>
    </div>
  );
};

export default Dashboard;