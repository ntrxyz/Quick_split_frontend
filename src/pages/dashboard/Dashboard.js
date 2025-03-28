import React, {  useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import logo from "../../assets/logo.jpeg"; // App logo
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap for modal
import "bootstrap/dist/js/bootstrap.bundle.min";
import { FaTrash } from "react-icons/fa";
import Profile from "../profile/Profile";
import Report from "../report/Report";
import profile from "../../assets/user.png";
import logout from "../../assets/logout.png";
import Groups from "../groups/Groups";
import AddUserToAGroup from "../groups/AddUserToAGroup";

const users = ["Alice", "Bob", "Charlie", "David"];
// Sample users

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "dashboard";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [expense, setExpense] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    paidBy: "You",
    splitType: "equally",
    participants: [],
  });

  const [expensesList, setExpensesList] = useState([]); // Stores all expenses

 

  const handleAddExpense = () => {
    if (
      !expense.description ||
      !expense.amount ||
      expense.participants.length === 0
    ) {
      alert("Please fill all details and select participants!");
      return;
    }

    setExpensesList([...expensesList, expense]); // Add expense to list
    setExpense({
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      paidBy: "You",
      splitType: "equally",
      participants: [],
    });

    document.getElementById("closeExpenseModal").click(); // Close modal
  };

  const handleDeleteExpense = (index) => {
    const updatedExpenses = expensesList.filter((_, i) => i !== index);
    setExpensesList(updatedExpenses);
  };

  const handleParticipantsChange = (event) => {
    const selectedOptions = Array.from(
      event.target.selectedOptions,
      (option) => option.value
    );
    setExpense({ ...expense, participants: selectedOptions });
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId"); // Clear user ID if stored
    navigate("/"); // Redirect to login page
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-container">
          <img src={logo} alt="App Logo" className="app-logo" />
          <h2 className="my-4">Quick-Split</h2>
        </div>
        <nav>
          <ul className="my-2">
            <li
              className={`my-2 ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              Profile
            </li>
            <li
              className={`my-2 ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </li>
            <li
              className={`my-2 ${activeTab === "recent" ? "active" : ""}`}
              onClick={() => setActiveTab("expenses")}
            >
              Recent Activity
            </li>
            <li
              className={`my-2 ${activeTab === "expenses" ? "active" : ""}`}
              onClick={() => setActiveTab("expenses")}
            >
              All Expenses
            </li>
            <li
              className={`my-2 ${activeTab === "reports" ? "active" : ""}`}
              onClick={() => setActiveTab("reports")}
            >
              Reports
            </li>
            <li
              className={`my-2 ${activeTab === "groups" ? "active" : ""}`}
              onClick={() => setActiveTab("groups")}
            >
              Groups
            </li>

            <button
              className={`invite-btn my-2 ${
                activeTab === "add user to group" ? "active" : ""
              }`}
              onClick={() => setActiveTab("add user to group")}
            >
              Add User to a Group
            </button>
          </ul>
        </nav>
      </aside>

      {/* Main Dashboard */}
      <main className="dashboard">
        <header>
          <h2>Dashboard</h2>
          <div>
            <img
              src={profile}
              alt="Profile"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%", // Makes it circular
                cursor: "pointer",
                marginRight: "10px",
                border: "2px solid #ddd", // Light border for a neat look
                objectFit: "cover", // Ensures the image fits well
                transition: "transform 0.2s ease-in-out",
              }}
            />

            <button
              className="btn btn-dark dropdown-toggle mx-2"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              User
            </button>
            <ul class="dropdown-menu">
              <li>
                <button className="dropdown-item"  onClick={() => setActiveTab("profile")}>
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
              data-bs-toggle="modal"
              data-bs-target="#expenseModal"
            >
              Add an Expense
            </button>
            <button className="settle-up mx-2">Settle Up</button>
            <img
              src={logout}
              alt="Profile"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%", // Makes it circular
                cursor: "pointer",
                marginRight: "10px",
                border: "2px solid #ddd", // Light border for a neat look
                objectFit: "cover", // Ensures the image fits well
                transition: "transform 0.2s ease-in-out",
              }}
              onClick={handleLogout} // Replace with actual logout logic
            />
          </div>
        </header>
        {activeTab === "dashboard" && (
          <>
            <div className="balance-summary">
              <p>
                Total Balance: <span className="positive">$302.00</span>
              </p>
              <p>
                You Owe: <span className="neutral">$5.00</span>
              </p>
              <p>
                You Are Owed: <span className="positive">$302.00</span>
              </p>
            </div>
          </>
        )}

        {activeTab === "profile" && <Profile />}
        {activeTab === "reports" && <Report />}
        {activeTab === "groups" && <Groups />}
        {activeTab === "add user to group" && (
          <AddUserToAGroup loggedInUser="user1" />
        )}

        {/* Transaction List */}
        {activeTab === "expenses" && (
          <>
            <div className="transactions">
              <h3>Expenses</h3>
              {expensesList.length === 0 ? (
                <p>No expenses added yet</p>
              ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: "20px",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "#1a3b58",
                        color: "#fff",
                        textTransform: "uppercase",
                      }}
                    >
                      <th>Description</th>
                      <th>Amount ($)</th>
                      <th>Paid By</th>
                      <th>Split Type</th>
                      <th>Participants</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expensesList.map((exp, index) => (
                      <tr
                        key={index}
                        style={{ borderBottom: "1px solid #e0e0e0" }}
                      >
                        <td>{exp.description}</td>
                        <td>{exp.amount}</td>
                        <td style={{ color: "#f9a825", fontWeight: "bold" }}>
                          {exp.paidBy}
                        </td>
                        <td style={{ color: "#f9a825", fontWeight: "bold" }}>
                          {exp.splitType}
                        </td>
                        <td>{exp.participants.join(", ")}</td>
                        <td>
                          <button
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "red",
                            }}
                            onClick={() => handleDeleteExpense(index)}
                          >
                            <FaTrash size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>

      {/* Expense Modal */}
      <div
        className="modal fade"
        id="expenseModal"
        tabIndex="-1"
        aria-labelledby="expenseModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="expenseModalLabel">
                Add an Expense
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                id="closeExpenseModal"
              ></button>
            </div>
            <div className="modal-body">
              {/* Description */}
              <label className="form-label">Description</label>
              <input
                type="text"
                className="form-control"
                value={expense.description}
                onChange={(e) =>
                  setExpense({ ...expense, description: e.target.value })
                }
              />

              {/* Amount */}
              <label className="form-label mt-3">Amount ($)</label>
              <input
                type="number"
                className="form-control"
                value={expense.amount}
                onChange={(e) =>
                  setExpense({ ...expense, amount: e.target.value })
                }
              />

              {/* Date */}
              <label className="form-label mt-3">Date</label>
              <input
                type="date"
                className="form-control"
                value={expense.date}
                onChange={(e) =>
                  setExpense({ ...expense, date: e.target.value })
                }
              />

              {/* Paid By */}
              <label className="form-label mt-3">Paid By</label>
              <select
                className="form-control"
                value={expense.paidBy}
                onChange={(e) =>
                  setExpense({ ...expense, paidBy: e.target.value })
                }
              >
                <option value="You">You</option>
                {users.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>

              {/* Split Type */}
              <label className="form-label mt-3">Split Type</label>
              <select
                className="form-control"
                value={expense.splitType}
                onChange={(e) =>
                  setExpense({ ...expense, splitType: e.target.value })
                }
              >
                <option value="equally">Equally</option>
                <option value="percentage">By Percentage</option>
                <option value="shares">By Shares</option>
              </select>

              {/* Participants (Multi-Select) */}
              <label className="form-label mt-3">Select Participants</label>
              <select
                className="form-control"
                multiple
                value={expense.participants}
                onChange={handleParticipantsChange}
              >
                {users.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-danger"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleAddExpense}
              >
                Save Expense
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
