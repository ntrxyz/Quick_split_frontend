import React, { useState, useEffect } from "react";
import { createGroup } from "../../services/GroupService";
import "./CreateGroup.css";

const CreateGroup = () => {
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const loggedInUserId = localStorage.getItem("userId"); // Get logged-in user ID

  // ✅ Add logged-in user as a default member
  useEffect(() => {
    if (loggedInUserId) {
      setMembers([{ userId: loggedInUserId, name: "You" }]);
    }
  }, [loggedInUserId]);

  // ✅ Handle Adding a New Member
  const addMember = () => {
    setMembers([...members, { userId: "", name: "", email: "" }]);
  };

  // ✅ Handle Removing a Member (Logged-in user cannot be removed)
  const removeMember = (index) => {
    if (members[index].userId === loggedInUserId) return; // Prevent removal
    setMembers(members.filter((_, i) => i !== index));
  };

  // ✅ Handle Creating a Group
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setMessage("❌ Group name is required!");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const group = await createGroup(groupName, members);
      setMessage(`✅ Group "${group.name}" created successfully!`);
      setGroupName(""); // Reset form
      setMembers([{ userId: loggedInUserId, name: "You (Logged-in User)" }]);
    } catch (error) {
      setMessage("❌ Failed to create group. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-group-page">
      <div className="create-group-container">
        <h2>Start a New Group</h2>

        {/* Display Success/Error Message */}
        {message && <p className="message">{message}</p>}

        {/* Group Name Input */}
        <input
          type="text"
          placeholder="My group shall be called..."
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        {/* Group Members */}
        <h3>Group Members</h3>
        {members.map((member, index) => (
          <div className="member-input" key={index}>
            <input
              type="text"
              placeholder="Name"
              value={member.name}
              onChange={(e) =>
                setMembers(members.map((m, i) => (i === index ? { ...m, name: e.target.value } : m)))
              }
              disabled={member.userId === loggedInUserId} // Disable editing logged-in user
            />
            <input
              type="email"
              placeholder="Email address (optional)"
              value={member.email || ""}
              onChange={(e) =>
                setMembers(members.map((m, i) => (i === index ? { ...m, email: e.target.value } : m)))
              }
              disabled={member.userId === loggedInUserId} // Disable editing logged-in user
            />
            {member.userId !== loggedInUserId && (
              <button onClick={() => removeMember(index)}>❌</button>
            )}
          </div>
        ))}

        {/* Add Member Button */}
        <button onClick={addMember} className="add-member-btn my-2">+ Add a person</button>

        {/* Group Type Dropdown */}
        <h3>Group Type</h3>
        <select>
          <option>Home</option>
          <option>Trip</option>
          <option>Couple</option>
          <option>Other</option>
        </select>

        {/* Save Group Button */}
        <button onClick={handleCreateGroup} className="save-group-btn" disabled={loading}>
          {loading ? "Creating..." : "Save Group"}
        </button>
      </div>
    </div>
  );
};

export default CreateGroup;
