import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { getUserGroups, deleteGroup } from "../../services/GroupService";
import "./Groups.css";

const Groups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch groups once on mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await getUserGroups();
        console.log("📦 Fetched groups:", data);
        setGroups(data || []);
      } catch (error) {
        console.error("❌ Error fetching groups:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Handle group deletion
  const handleDeleteGroup = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this group?");
    if (!confirmDelete) return;

    try {
      await deleteGroup(id);
      setGroups((prev) => prev.filter((group) => group.id !== id));
    } catch (error) {
      console.error("❌ Failed to delete group:", error);
      alert("Something went wrong while deleting the group.");
    }
  };

  return (
    <div className="groups-container my-2">
      <h2 className="groups-title">📋 Your Groups</h2>

      <button className="add-group-btn my-4" onClick={() => navigate("/groups/new")}>
        + Create Group
      </button>

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
                <p>
                  Recent:{" "}
                  {group.recentExpense ? group.recentExpense : "No expenses yet"}
                </p>
              </Link>

              <div className="group-actions">
                <button className="edit-btn" disabled>
                  <FaEdit /> Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDeleteGroup(group.id)}
                >
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
