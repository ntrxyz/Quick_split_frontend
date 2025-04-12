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
import { useExpenseContext } from "../../context/ExpenseContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "dashboard";

  const [activeTab, setActiveTab] = useState(initialTab);
  const { expenses, loading } = useExpenseContext();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    navigate("/");
  };

  // Calculate balance details based on the current logged in user
  const currentUser = localStorage.getItem("userId");

  let totalOwedToMe = 0; // Money others owe you (for expenses you paid)
  let totalIOwe = 0; // Money you owe (for expenses you did not pay)

  expenses.forEach((exp) => {
    if (exp.sharedWith && exp.sharedWith.length > 0 && exp.amount > 0) {
      // Calculate an equal share
      const share = parseFloat(exp.amount) / exp.sharedWith.length;
      if (exp.paidBy === currentUser) {
        // If you paid, then you're owed the extra you covered beyond your share.
        totalOwedToMe += (parseFloat(exp.amount) - share);
      } else if (exp.sharedWith.includes(currentUser)) {
        // Otherwise you owe your share.
        totalIOwe += share;
      }
    }
  });
  // Net balance: What you're owed minus what you owe.
  const totalBalance = totalOwedToMe - totalIOwe;

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
            <button className="settle-up mx-2">Settle Up</button>
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
              {loading ? (
                <p>Loading balance...</p>
              ) : (
                <>
                  <p>
                    Total Balance:{" "}
                    <span className={totalBalance >= 0 ? "positive" : "negative"}>
                      ₹{totalBalance.toFixed(2)}
                    </span>
                  </p>
                  <p>
                    You Owe:{" "}
                    <span className="neutral">
                      ₹{totalIOwe.toFixed(2)}
                    </span>
                  </p>
                  <p>
                    You Are Owed:{" "}
                    <span className="positive">
                      ₹{totalOwedToMe.toFixed(2)}
                    </span>
                  </p>
                </>
              )}
            </div>
            <div>
              <AllExpenses />
            </div>
          </div>
        )}

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