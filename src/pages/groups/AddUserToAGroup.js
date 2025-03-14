import React, { useState, useEffect } from "react";
import "./AddUserToAGroup.css";
import img from "../../assets/adduser.png";

const AddUserToAGroup = ({ loggedInUser }) => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  // Mock fetching groups and users (Replace with API calls)
  useEffect(() => {
    // Mock data
    const fetchedGroups = [
      { id: 1, name: "Friends" },
      { id: 2, name: "Family" },
      { id: 3, name: "Colleagues" },
    ];
    const fetchedUsers = [
      { id: "user1", name: "Alice" },
      { id: "user2", name: "Bob" },
      { id: "user3", name: "Charlie" },
    ];

    setGroups(fetchedGroups);
    setUsers(fetchedUsers);

    // Ensure the logged-in user is always included
    setSelectedUsers(new Set([loggedInUser.id]));
  }, [loggedInUser]);

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

  const handleSubmit = () => {
    if (!selectedGroup) {
      alert("Please select a group");
      return;
    }
    if (selectedUsers.size === 0) {
      alert("Please select at least one user");
      return;
    }

    console.log("Adding users to group:", {
      groupId: selectedGroup,
      users: Array.from(selectedUsers),
    });

    alert(`Users added to group successfully!`);
  };

  return (
    <div className="add-user">
      <div className="add-user-container">
        <h2>Add Users</h2>

        {/* Group Selection */}
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

        {/* User Selection */}
        <div className="user-selection">
          <h3>Select Users:</h3>
          {users.map((user) => (
            <label key={user.id} className="user-checkbox">
              <input
                type="checkbox"
                value={user.id}
                checked={selectedUsers.has(user.id)}
                onChange={() => handleUserSelection(user.id)}
                disabled={user.id === loggedInUser.id} // Logged-in user is always selected
              />
              {user.name} {user.id === loggedInUser.id && "(You)"}
            </label>
          ))}
        </div>

        {/* Submit Button */}
        <button onClick={handleSubmit} className="submit-btn">
          Add to Group
        </button>
      </div>
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
        <img src={img} style={{ width: "100%", borderRadius: "5px" }} />
      </div>
    </div>
  );
};

export default AddUserToAGroup;
