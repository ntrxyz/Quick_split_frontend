import React, { useState, useContext } from "react";
import { Check } from "lucide-react";
import { addUserToGroup } from "../../services/GroupService";
import { getUserByEmail } from "../../services/userService";
import { GroupsContext } from "../../context/GroupsContext";
import img from "../../assets/adduser.jpg";
import "./AddUserToAGroup.css";

const AddUserToAGroup = () => {
  const { groups } = useContext(GroupsContext);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [email, setEmail] = useState("");
  const [addedEmails, setAddedEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAddSingleEmail = async () => {
    if (!selectedGroup || !email.trim()) {
      alert("⚠️ Please select a group and enter an email.");
      return;
    }

    setLoading(true);
    try {
      const user = await getUserByEmail(email.trim());
      if (user?.id) {
        await addUserToGroup(selectedGroup, user.id);
        setAddedEmails((prev) => [...prev, email.trim()]);
        setEmail("");
      } else {
        alert(`❌ No user found with email: ${email}`);
      }
    } catch (err) {
      console.error("Error adding user:", err);
      alert("❌ Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (addedEmails.length === 0) {
      alert("⚠️ No users were added.");
    } else {
      alert("✅ All users added to the group!");
    }

    setSelectedGroup("");
    setEmail("");
    setAddedEmails([]);
  };

  return (
    <div className="add-user-container-wrapper">
      <div className="add-user-left">
        <h2 className="section-title">➕ Add Users to Group</h2>

        <label className="input-label">Select Group:</label>
        <select
          className="styled-select"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="">Choose a group</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>

        <label className="input-label">Enter User Email:</label>
        <div className="email-input-row">
          <input
            type="email"
            className="email-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. someone@example.com"
          />
          <Check className="tick-icon" onClick={handleAddSingleEmail} />
        </div>

        <ul className="email-list">
          {addedEmails.map((email, idx) => (
            <li key={idx}>{email}</li>
          ))}
        </ul>

        <button onClick={handleSave} className="submit-btn">
          Add to Group
        </button>
      </div>

      <div className="add-user-right">
        <img src={img} alt="Add User" className="side-image" />
      </div>
    </div>
  );
};

export default AddUserToAGroup;
