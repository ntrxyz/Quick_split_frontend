// src/components/Dashboard.js
import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import profile from "../../assets/user.png";
import logout from "../../assets/logout.png";
import Profile from "../profile/Profile";
import Report from "../report/Report";
import Groups from "../groups/Groups";
import AddUserToAGroup from "../groups/AddUserToAGroup";
import { GroupsContext } from "../../context/GroupsContext";
import { getGroupById } from "../../services/GroupService";
import { addExpense } from "../../services/ExpenseService";
import { getUserProfile } from "../../services/userService";
import Sidebar from "../../components/sidebar/Sidebar"; // Import Sidebar component

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "dashboard";
  const { groups } = useContext(GroupsContext);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [expensesList, setExpensesList] = useState([]);
  const [groupUsers, setGroupUsers] = useState([]);
  const [expense, setExpense] = useState({
    title: "",
    description: "",
    amount: "",
    paidBy: "",
    participants: [],
  });

  useEffect(() => {
    const fetchGroupUsers = async () => {
      if (!selectedGroupId) {
        setGroupUsers([]);
        return;
      }

      try {
        const group = await getGroupById(selectedGroupId);
        const memberIdsArray = group.members || group.users || [];

        const usersData = await Promise.all(
          memberIdsArray.map(async (userId) => {
            try {
              return await getUserProfile(userId);
            } catch (error) {
              return null;
            }
          })
        );

        const validUsers = usersData.filter((user) => user !== null);
        setGroupUsers(validUsers);
      } catch (err) {
        setGroupUsers([]);
      }
    };

    fetchGroupUsers();
  }, [selectedGroupId]);

  const handleCheckboxChange = (userId) => {
    setExpense((prev) => {
      const currentParticipants = prev.participants || [];
      const updatedParticipants = currentParticipants.includes(userId)
        ? currentParticipants.filter((id) => id !== userId)
        : [...currentParticipants, userId];

      return {
        ...prev,
        participants: updatedParticipants,
      };
    });
  };

  const handleAddExpense = async () => {
    const { title, description, amount, paidBy, participants } = expense;
    const userId = localStorage.getItem("userId");

    if (!selectedGroupId || !paidBy || !amount || !description) {
      alert("❗ Please fill all required fields.");
      return;
    }

    try {
      await addExpense({
        title,
        amount: parseFloat(amount),
        groupId: selectedGroupId,
        description,
        userId,
        paidBy,
        participants: participants || [],
      });

      alert("✅ Expense added!");
      setExpense({
        title: "",
        description: "",
        amount: "",
        paidBy: "",
        participants: [],
      });
      setSelectedGroupId("");
      document.getElementById("closeExpenseModal")?.click();
    } catch (err) {
      alert("❌ Failed to add expense.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      {/* Use Sidebar component here */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

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
            <button className="btn btn-dark dropdown-toggle mx-2" type="button" data-bs-toggle="dropdown">
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
            <button className="add-expense mx-2" data-bs-toggle="modal" data-bs-target="#expenseModal">
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
        {activeTab === "expenses" && <Groups />}
        {activeTab === "add user to group" && <AddUserToAGroup />}
      </main>
    </div>
  );
};

export default Dashboard;
