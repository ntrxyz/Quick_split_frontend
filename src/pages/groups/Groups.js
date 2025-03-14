import React from "react";
import { Link } from "react-router-dom";
import "./Groups.css";

const groupsData = [
  {
    id: 1,
    name: "Weekend Trip",
    recentExpense: "Dinner - ₹1200",
  },
  {
    id: 2,
    name: "Office Lunch",
    recentExpense: "Pizza Party - ₹800",
  },
  {
    id: 3,
    name: "Flatmates",
    recentExpense: "Electricity Bill - ₹2500",
  },
];

const Groups = () => {
  return (
    <div className="groups-container">
      <h2>Groups</h2>
      <button className="add-group-btn my-4">+ Create Group</button>
      <div className="groups-list">
        {groupsData.map((group) => (
          <Link key={group.id} to={`/groups/${group.id}`} className="group-card">
            <h3>{group.name}</h3>
            <p>Recent: {group.recentExpense}</p>
          </Link>
        ))}
      </div>
      
    </div>
  );
};

export default Groups;
