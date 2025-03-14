import React, { useState } from "react";
import "./CreateGroup.css";

const CreateGroup = () => {
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState([{ name: "", email: "" }]);

  // Handle Adding a New Member
  const addMember = () => {
    setMembers([...members, { name: "", email: "" }]);
  };

  // Handle Removing a Member
  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  return (
    <div className="create-group-page">
    <div className="create-group-container">
      <h2>Start a New Group</h2>

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
        <div className="member-input " key={index}>
          <input
            type="text"
            placeholder="Name"
            value={member.name}
            onChange={(e) =>
              setMembers(members.map((m, i) => i === index ? { ...m, name: e.target.value } : m))
            }
          />
          <input
            type="email"
            placeholder="Email address (optional)"
            value={member.email}
            onChange={(e) =>
              setMembers(members.map((m, i) => i === index ? { ...m, email: e.target.value } : m))
            }
          />
          {index !== 0 && (
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

      {/* Save Button */}
      <button className="save-group-btn">Save Group</button>
    </div>
    </div>
  );
};

export default CreateGroup;
