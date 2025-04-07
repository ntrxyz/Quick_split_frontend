import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createGroup, addUserToGroup } from "../../services/GroupService";
import "./CreateGroup.css";

const CreateGroup = () => {
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const loggedInUserId = localStorage.getItem("userId");

  useEffect(() => {
    if (!loggedInUserId) {
      setMessage("❌ User not logged in. Please log in first.");
    }
  }, [loggedInUserId]);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setMessage("❌ Group name is required!");
      return;
    }

    if (!loggedInUserId) {
      setMessage("❌ Cannot create group without login.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Step 1: Create the group
      const group = await createGroup(groupName);
      if (!group?.id) throw new Error("Group creation failed");

      setMessage(`✅ Group "${group.name}" created successfully!`);

      // Step 2: Add the logged-in user to the group
      await addUserToGroup(group.id, loggedInUserId);
      console.log("✅ User added to group");

      // Step 3: Redirect to dashboard after short delay
      setTimeout(() => {
        navigate("/dashboard?tab=groups");
      }, 1500);
    } catch (error) {
      console.error("❌ Error creating group or adding user:", error);
      setMessage("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-group-page">
      <div className="create-group-container">
        <h2>➕ Start a New Group</h2>

        {message && <p className="message">{message}</p>}

        <input
          type="text"
          placeholder="Enter group name..."
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="group-name-input"
        />

        <button
          onClick={handleCreateGroup}
          className="save-group-btn my-2"
          disabled={loading}
        >
          {loading ? "Creating..." : "Save Group"}
        </button>
      </div>
    </div>
  );
};

export default CreateGroup;
