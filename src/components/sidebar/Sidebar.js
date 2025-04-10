// src/components/Sidebar.js
import React, { useContext } from "react";
import "./Sidebar.css"
import { useNavigate } from "react-router-dom";
import { GroupsContext } from "../../context/GroupsContext";
import logo from "../../assets/logo.jpeg";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { groups } = useContext(GroupsContext);
  const navigate = useNavigate();

  return (
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
            className={`invite-btn my-2 ${activeTab === "add user to group" ? "active" : ""}`}
            onClick={() => setActiveTab("add user to group")}
          >
            Add User to a Group
          </button>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
