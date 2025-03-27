import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import { createGroup, addUserToGroup } from "../../services/GroupService";
import "./CreateGroup.css";

const CreateGroup = () => {
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState([]);
  const [groupId, setGroupId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // ✅ Initialize navigate
  const loggedInUserId = localStorage.getItem("userId");

  useEffect(() => {
    if (loggedInUserId) {
      setMembers([{ userId: loggedInUserId, name: "You" }]);
    }
  }, [loggedInUserId]);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setMessage("❌ Group name is required!");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const group = await createGroup(groupName);
      setGroupId(group.id);
      setMessage(`✅ Group "${group.name}" created successfully!`);

      // ✅ Redirect to Dashboard after a short delay
      setTimeout(() => {
        navigate("/dashboard?tab=groups");
      }, 1500);
      
    } catch (error) {
      setMessage("❌ Failed to create group. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-group-page">
      <div className="create-group-container">
        <h2>Start a New Group.</h2>

        {message && <p className="message">{message}</p>}

        <input
          type="text"
          placeholder="Enter group name..."
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <button onClick={handleCreateGroup} className="save-group-btn my-2" disabled={loading}>
          {loading ? "Creating..." : "Save Group"}
        </button>
      </div>
    </div>
  );
};

export default CreateGroup;
