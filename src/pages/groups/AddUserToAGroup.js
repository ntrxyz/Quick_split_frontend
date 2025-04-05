import React, { useState, useEffect } from "react";
import { getUserGroups, addUserToGroup } from "../../services/GroupService";
import { getAllUsers } from "../../services/userService"; // Fetch users from a separate service
import "./AddUserToAGroup.css";
import img from "../../assets/adduser.png";

const AddUserToAGroup = ({ loggedInUser }) => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  // ✅ Fetch Groups and Users from Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedGroups = await getUserGroups();
        const fetchedUsers = await getAllUsers();
        setGroups(fetchedGroups);
        setUsers(fetchedUsers);

        // Ensure logged-in user is always selected
        setSelectedUsers(new Set([loggedInUser.id]));
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      }
    };
    fetchData();
  }, [loggedInUser]);

  // ✅ Handle User Selection
  const handleUserSelection = (userId) => {
    setSelectedUsers((prevSelected) => {
      const updatedSelection = new Set(prevSelected);
      if (updatedSelection.has(userId)) {
        updatedSelection.delete(userId);
      } else {
        updatedSelection.add(userId);
      }
      return updatedSelection;
    });
  };

  // ✅ Handle Adding Users to Group
  const handleSubmit = async () => {
    if (!selectedGroup) {
      alert("⚠️ Please select a group");
      return;
    }
    if (selectedUsers.size === 0) {
      alert("⚠️ Please select at least one user");
      return;
    }

    try {
      for (const userId of selectedUsers) {
        await addUserToGroup(selectedGroup, userId); // API Call
      }
      alert("✅ Users added successfully!");
      setSelectedUsers(new Set([loggedInUser.id])); // Reset selection
      setSelectedGroup("");
    } catch (error) {
      console.error("❌ Error adding users:", error);
      alert("Failed to add users. Please try again.");
    }
  };

  return (
    <div className="add-user">
      <div className="add-user-container">
        <h2>Add Users</h2>

        {/* ✅ Group Selection */}
        <label>Select Group:</label>
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="">-- Select a group --</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>

        {/* ✅ User Selection */}
        <div className="user-selection">
          <h3>Select Users:</h3>
          {users.map((user) => (
            <label key={user.id} className="user-checkbox">
              <input
                type="checkbox"
                value={user.id}
                checked={selectedUsers.has(user.id)}
                onChange={() => handleUserSelection(user.id)}
                disabled={user.id === loggedInUser.id} // ✅ Ensure logged-in user is always included
              />
              {user.name} {user.id === loggedInUser.id && "(You)"}
            </label>
          ))}
        </div>

        {/* ✅ Submit Button */}
        <button onClick={handleSubmit} className="submit-btn">
          Add to Group
        </button>
      </div>

      {/* ✅ Right-Side Image */}
      <div
        style={{
          padding: "15px",
          width: "690px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          borderRadius: "10px",
          backgroundColor: "#fff",
          position: "absolute",
          right: "20px",
          top: "120px",
        }}
      >
        <img src={img} style={{ width: "100%", borderRadius: "5px" }} alt="Add User" />
      </div>
    </div>
  );
};

export default AddUserToAGroup;
