import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import { getUserGroups, deleteGroup, updateGroupName } from "../../services/GroupService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Groups.css";

const Groups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");

  // Fetch groups on mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await getUserGroups();
        console.log("📦 Fetched groups:", data);
        setGroups(data || []);
        toast.success("✅ Groups loaded successfully!");
      } catch (error) {
        console.error("❌ Error fetching groups:", error);
        toast.error("❌ Failed to load groups. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Delete group using a custom toast confirmation with buttons
  const handleDeleteGroup = (id) => {
    toast(
      ({ closeToast }) => (
        <div>
          <p>Are you sure you want to delete this group?</p>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              style={{
                backgroundColor: "#4caf50",
                border: "none",
                color: "white",
                padding: "5px 10px",
                cursor: "pointer",
                marginRight: "5px",
              }}
              onClick={async () => {
                try {
                  await deleteGroup(id);
                  setGroups((prev) => prev.filter((group) => group.id !== id));
                  toast.success("✅ Group deleted successfully!");
                } catch (error) {
                  console.error("❌ Failed to delete group:", error);
                  toast.error("❌ Something went wrong while deleting the group.");
                } finally {
                  closeToast();
                }
              }}
            >
              Confirm
            </button>
            <button
              style={{
                backgroundColor: "#f44336",
                border: "none",
                color: "white",
                padding: "5px 10px",
                cursor: "pointer",
              }}
              onClick={closeToast}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        position: "top-right",
        autoClose: false, // The toast will remain until one of the buttons is clicked
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  // Update group name
  const handleUpdateGroupName = async (groupId) => {
    if (!newGroupName.trim()) {
      toast.warning("⚠️ Group name cannot be empty!");
      return;
    }

    try {
      await updateGroupName(groupId, newGroupName.trim());
      setGroups((prev) =>
        prev.map((group) =>
          group.id === groupId ? { ...group, name: newGroupName.trim() } : group
        )
      );
      setEditingGroupId(null);
      setNewGroupName("");
      toast.success("✅ Group name updated successfully!");
    } catch (error) {
      console.error("❌ Error updating group name:", error);
      toast.error("❌ Failed to update group name.");
    }
  };

  return (
    <div className="groups-container my-2">
      <h2 className="groups-title">📋 Your Groups</h2>

      <button
        className="add-group-btn my-4"
        onClick={() => navigate("/groups/new")}
      >
        + Create Group
      </button>

      {loading ? (
        <p>Loading groups...</p>
      ) : groups.length === 0 ? (
        <p>
          No groups yet. <Link to="/groups/new">Create one!</Link>
        </p>
      ) : (
        <div className="groups-list">
          {groups.map((group) => (
            <div key={group.id} className="group-card">
              <div className="group-info">
                {editingGroupId === group.id ? (
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <Link to={`/groups/${group.id}`}>
                    <h3>{group.name}</h3>
                  </Link>
                )}
                <p>{group.recentExpense ? group.recentExpense : ""}</p>
              </div>

              <div className="group-actions">
                {editingGroupId === group.id ? (
                  <>
                    <button
                      className="save-btn"
                      onClick={() => handleUpdateGroupName(group.id)}
                    >
                      <FaSave /> Save
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => {
                        setEditingGroupId(null);
                        setNewGroupName("");
                      }}
                    >
                      <FaTimes /> Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setEditingGroupId(group.id);
                      setNewGroupName(group.name);
                    }}
                  >
                    <FaEdit /> Edit
                  </button>
                )}

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

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Groups;