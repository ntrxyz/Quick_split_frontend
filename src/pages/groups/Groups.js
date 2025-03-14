import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa"; // Import icons
import "./Groups.css";

const initialGroupsData = [
  { id: 1, name: "Weekend Trip", recentExpense: "Dinner - ₹1200" },
  { id: 2, name: "Office Lunch", recentExpense: "Pizza Party - ₹800" },
  { id: 3, name: "Flatmates", recentExpense: "Electricity Bill - ₹2500" },
];

const Groups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState(initialGroupsData);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");

  // Function to navigate to the create group page
  const handleCreateGroup = () => {
    navigate("/groups/new");
  };

  // Function to delete a group
  const handleDeleteGroup = (id) => {
    setGroups(groups.filter((group) => group.id !== id));
  };

  // Function to start editing a group name
  const handleEditGroup = (id, currentName) => {
    setEditingGroupId(id);
    setNewGroupName(currentName);
  };

  // Function to save the edited group name
  const handleSaveGroupName = (id) => {
    setGroups(
      groups.map((group) =>
        group.id === id ? { ...group, name: newGroupName } : group
      )
    );
    setEditingGroupId(null);
  };

  return (
    <div className="groups-container my-2">
      <h2>Groups</h2>

      {/* Button to Open the Create Group Page */}
      <button className="add-group-btn my-4" onClick={handleCreateGroup}>
        + Create Group
      </button>

      <div className="groups-list">
        {groups.map((group) => (
          <div key={group.id} className="group-card">
            {editingGroupId === group.id ? (
              <div className="edit-group">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
                <button className="save-btn" onClick={() => handleSaveGroupName(group.id)}>
                  Save
                </button>
              </div>
            ) : (
              <>
                <Link to={`/groups/${group.id}`} className="group-info">
                  <h3>{group.name}</h3>
                  <p>Recent: {group.recentExpense}</p>
                </Link>
                <div className="group-actions">
                  <button className="edit-btn" onClick={() => handleEditGroup(group.id, group.name)}>
                    <FaEdit /> Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDeleteGroup(group.id)}>
                    <FaTrash /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Groups;
