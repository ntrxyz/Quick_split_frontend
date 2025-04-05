import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { getUserGroups, deleteGroup } from "../../services/GroupService"; // Import API functions
import "./Groups.css";

const Groups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");

  // Fetch user groups on component mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await getUserGroups();
        setGroups(data || []); // Ensure an empty array if no data
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  // Handle group deletion
  const handleDeleteGroup = async (id) => {
    try {
      await deleteGroup(id);
      setGroups(groups.filter((group) => group.id !== id));
    } catch (error) {
      console.error("Failed to delete group:", error);
    }
  };

  return (
    <div className="groups-container my-2">
      <h2>Groups</h2>
      
      {/* Create Group Button */}
      <button className="add-group-btn my-4" onClick={() => navigate("/groups/new")}>
        + Create Group
      </button>

      {/* Display groups or "No groups" message */}
      {loading ? (
        <p>Loading groups...</p>
      ) : groups.length === 0 ? (
        <p>No groups yet. <Link to="/groups/new">Create one!</Link></p>
      ) : (
        <div className="groups-list">
          {groups.map((group) => (
            <div key={group.id} className="group-card">
              <Link to={`/groups/${group.id}`} className="group-info">
                <h3>{group.name}</h3>
                <p>Recent: {group.recentExpense || "No expenses yet"}</p>
              </Link>
              <div className="group-actions">
                <button className="edit-btn">
                  <FaEdit /> Edit
                </button>
                <button className="delete-btn" onClick={() => handleDeleteGroup(group.id)}>
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Groups;
