import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { toast, ToastContainer } from "react-toastify";
import config from "../../Config";
import { settleExpense } from "../../services/ExpenseService";
import { useExpenseContext } from "../../context/ExpenseContext";
import { useTransaction } from "../../context/TransactionContext";
import Profile from "../profile/Profile";
import Report from "../report/Report";
import Groups from "../groups/Groups";
import AddUserToAGroup from "../groups/AddUserToAGroup";
import Sidebar from "../../components/sidebar/Sidebar";
import AddExpense from "../expenses/addexpense/AddExpense";
import AllExpenses from "../expenses/allexpenses/AllExpenses";
import AllTransactions from "../transactions/alltransactions/AllTransactions";
import profile from "../../assets/user.png";
import logout from "../../assets/logout.png";
import "react-toastify/dist/ReactToastify.css";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "dashboard";

  const [activeTab, setActiveTab] = useState(initialTab);
  const { expenses, loading } = useExpenseContext();
  const { transactions, loadingTransactions } = useTransaction();
  const currentUser = localStorage.getItem("userId");

  // Calculate summary figures for dashboard
  let totalOwedToMeExpense = 0;
  let totalIOweExpense = 0;

  expenses.forEach((exp) => {
    const numParticipants = exp.sharedWith ? exp.sharedWith.length + 1 : 1;
    const share = parseFloat(exp.amount) / numParticipants;
    if (exp.paidBy === currentUser) {
      totalOwedToMeExpense += parseFloat(exp.amount) - share;
    } else if (exp.sharedWith && exp.sharedWith.includes(currentUser)) {
      totalIOweExpense += share;
    }
  });

  let transactionsNet = 0;
  if (transactions && transactions.length > 0) {
    transactions.forEach((tx) => {
      if (tx.payeeId === currentUser) {
        transactionsNet += Number(tx.amount);
      }
      if (tx.payerId === currentUser) {
        transactionsNet -= Number(tx.amount);
      }
    });
  }

  const expenseNet = totalOwedToMeExpense - totalIOweExpense;
  const finalNetBalance = expenseNet - transactionsNet;

  // This function iterates through all expenses and calls settleExpense
  // for each expense where the current user has not yet settled.
  const settleAllExpenses = async () => {
    try {
      const unsettledExpenses = expenses.filter((exp) => {
        return exp.sharedWith &&
          (!exp.settledBy || !exp.settledBy.includes(currentUser));
      });
      if (unsettledExpenses.length === 0) {
        toast.info("No expenses need settling.");
        return;
      }
      await Promise.all(
        unsettledExpenses.map((exp) =>
          settleExpense(exp._id || exp.id)
        )
      );
      toast.success("Expenses updated as settled successfully!");
    } catch (err) {
      toast.error("Settlement update failed: " + err.message);
    }
  };

  // After successful payment, Stripe redirects back to the dashboard
  // with ?settlement=success. We detect that here and trigger the settlement update.
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const settlement = query.get("settlement");
    if (settlement === "success") {
      settleAllExpenses();
      // Optionally, clear the query parameter by navigating to /dashboard 
      // without the settlement parameter:
      // navigate("/dashboard");
    }
  }, [location.search, expenses, currentUser, navigate]);

  // Initiate a payment via Stripe. The success_url is set so that after payment
  // the user is redirected back to our dashboard where we trigger settleAllExpenses.
  const handleSettleUp = async () => {
    const settlementAmount = Math.abs(finalNetBalance);
    if (settlementAmount === 0) {
      toast.info("No balance to settle at the moment.");
      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append("amount", settlementAmount.toString());
      formData.append(
        "success_url",
        `${window.location.origin}/dashboard?settlement=success`
      );
      formData.append(
        "cancel_url",
        `${window.location.origin}/dashboard`
      );

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

      const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
      if (!stripePublicKey) {
        throw new Error("Stripe public key not found.");
      }

      const stripe = await loadStripe(stripePublicKey);
      if (!stripe) throw new Error("Stripe failed to load.");

      const sessionId = response.data.id;
      const result = await stripe.redirectToCheckout({ sessionId });
      if (result.error) {
        toast.error(`Checkout failed: ${result.error.message}`);
      }
    } catch (error) {
      toast.error(`Stripe checkout error: ${error.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    toast.info("You have been logged out successfully!");
    setTimeout(() => {
      navigate("/");
    }, 500);
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
                <button
                  className="dropdown-item"
                  onClick={() => setActiveTab("profile")}
                >
                  Profile
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
            <button
              className="add-expense mx-2"
              onClick={() => setActiveTab("add-expense")}
            >
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
              {loading || loadingTransactions ? (
                <p>Calculating balance, please wait...</p>
              ) : (
                <>
                  <p>
                    Total Balance:{" "}
                    <span
                      className={finalNetBalance >= 0 ? "positive" : "negative"}
                    >
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

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Dashboard;