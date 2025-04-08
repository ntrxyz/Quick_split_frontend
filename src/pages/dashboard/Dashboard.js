import React, { useContext, useEffect, useState } from "react";
import config from "../../Config";
import { useLocation, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import logo from "../../assets/logo.jpeg";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { FaTrash } from "react-icons/fa";
import Profile from "../profile/Profile";
import Report from "../report/Report";
import profile from "../../assets/user.png";
import logout from "../../assets/logout.png";
import Groups from "../groups/Groups";
import AddUserToAGroup from "../groups/AddUserToAGroup";
import { GroupsContext } from "../../context/GroupsContext";
import { getGroupById } from "../../services/GroupService";
import { addExpense } from "../../services/ExpenseService";
import { getUserProfile } from "../../services/userService";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "dashboard";
  const { groups } = useContext(GroupsContext);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [expensesList, setExpensesList] = useState([]);
  const [users, setUsers] = useState([]);
  const [groupUsers, setGroupUsers] = useState([]);
  const [paidBy, setPaidBy] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [participants, setParticipants] = useState([]);

  const [expense, setExpense] = useState({
    description: "",
    amount: "",
    paidBy: "",
  });

  useEffect(() => {
    const fetchGroupUsers = async () => {
      if (!selectedGroupId) {
        setGroupUsers([]);
        return;
      }

      try {
        const group = await getGroupById(selectedGroupId); // returns { users: [userIds] }
        const usersData = await Promise.all(
          group.users.map(async (userId) => {
            try {
              return await getUserProfile(userId); // get full user details
            } catch (error) {
              console.error(`❌ Error fetching user ${userId}:`, error);
              return null;
            }
          })
        );

        const validUsers = usersData.filter((user) => user !== null);
        setGroupUsers(validUsers);
      } catch (err) {
        console.error("❌ Failed to fetch group users:", err);
        setGroupUsers([]);
      }
    };

    fetchGroupUsers();
  }, [selectedGroupId]);

  const handleCheckboxChange = (userId) => {
    setParticipants((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddExpense = async () => {
    const { description, amount, paidBy } = expense;
    const userId = localStorage.getItem("userId");

    if (!selectedGroupId || !paidBy || !amount || !description) {
      alert("❗ Please fill all required fields.");
      return;
    }

    try {
      await addExpense({
        title: description,
        amount: parseFloat(amount),
        groupId: selectedGroupId,
        description,
        userId,
        paidBy,
        participants,
      });

      alert("✅ Expense added!");

      // Reset form
      const [expense, setExpense] = useState({
        title: "",
        description: "",
        amount: "",
        paidBy: "",
      });

      setParticipants([]);

      setSelectedGroupId("");
      document.getElementById("closeExpenseModal")?.click();
    } catch (err) {
      console.error("❌ Error while adding expense:", err);
      alert("❌ Failed to add expense.");
    }
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
    localStorage.removeItem("userId");
    navigate("/");
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

      {/* Main Section */}
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
              aria-expanded="false"
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
              data-bs-toggle="modal"
              data-bs-target="#expenseModal"
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
        )}

        {activeTab === "profile" && <Profile />}
        {activeTab === "reports" && <Report />}
        {activeTab === "groups" && <Groups />}
        {activeTab === "add user to group" && <AddUserToAGroup />}
        {activeTab === "expenses" && (
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
                      key={exp._id || index}
                      style={{ borderBottom: "1px solid #e0e0e0" }}
                    >
                      <td>{exp.description}</td>
                      <td>{exp.amount}</td>
                      <td>{exp.paidBy}</td>
                      <td>{exp.splitType}</td>
                      <td>{exp.participants?.join(", ")}</td>
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
              {/* Group Selection */}
              <label className="form-label">Select Group</label>
              <select
                className="form-control mb-3"
                value={selectedGroupId}
                onChange={(e) => {
                  setSelectedGroupId(e.target.value);
                  setExpense({ ...expense, paidBy: "" });
                }}
              >
                <option value="">-- Select Group --</option>
                {groups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </select>

              {/* Title */}
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                value={expense.title}
                onChange={(e) =>
                  setExpense({ ...expense, title: e.target.value })
                }
              />

              {/* Description */}
              <label className="form-label mt-3">Description</label>
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

              {/* Paid By */}
              <label className="form-label mt-3">Paid By</label>
              <select
                className="form-control"
                value={expense.paidBy}
                onChange={(e) =>
                  setExpense({ ...expense, paidBy: e.target.value })
                }
                disabled={!groupUsers.length}
              >
                <option value="">-- Select User --</option>
                {groupUsers.map((user) =>
                  user?._id ? (
                    <div key={user._id} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value={user._id}
                        id={`participant-${user._id}`}
                        onChange={() => handleCheckboxChange(user._id)}
                        checked={participants.includes(user._id)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`participant-${user._id}`}
                      >
                        {user.username} ({user.email})
                      </label>
                    </div>
                  ) : null
                )}
              </select>

              <label className="form-label mt-3">Participants</label>
              <div>
                {groupUsers.map((user) => (
                  <div key={user._id} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value={user._id}
                      id={`participant-${user._id}`}
                      onChange={() => handleCheckboxChange(user._id)}
                      checked={participants.includes(user._id)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`participant-${user._id}`}
                    >
                      {user.username} ({user.email})
                    </label>
                  </div>
                ))}
              </div>
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
