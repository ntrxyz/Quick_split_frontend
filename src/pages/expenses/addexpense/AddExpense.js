import React, { useContext, useEffect, useState } from "react";
import { GroupsContext } from "../../../context/GroupsContext";
import { getUserProfile } from "../../../services/userService";
import { addExpense } from "../../../services/ExpenseService";
import { getGroupById } from "../../../services/GroupService";
import "./AddExpense.css";

const AddExpense = () => {
  const { groups } = useContext(GroupsContext);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [groupUsers, setGroupUsers] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(""); // Will store user ID
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!selectedGroupId) {
        setGroupUsers([]);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const groupData = await getGroupById(selectedGroupId);
        if (!groupData || !Array.isArray(groupData.members)) {
          throw new Error("Invalid group data structure");
        }

        const userProfiles = await Promise.all(
          groupData.members.map(async (memberId) => {
            try {
              const userData = await getUserProfile(memberId);
              return userData;
            } catch (err) {
              console.error(`Error fetching profile for member ${memberId}:`, err);
              return null;
            }
          })
        );

        const validUsers = userProfiles.filter((user) => user !== null);
        setGroupUsers(validUsers);
        setPaidBy("");
        setParticipants([]);
      } catch (err) {
        console.error("Error fetching group data:", err);
        setError("Failed to load group members. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [selectedGroupId]);

  const handleParticipantChange = (userId) => {
    setParticipants((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedGroupId || !description || !amount || !paidBy || participants.length === 0) {
      setError("Please fill in all fields and select at least one participant.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("You are not logged in. Please log in and try again.");
        return;
      }

      // Convert all participant IDs to strings if they aren't already
      const formattedParticipants = participants.map(id => String(id));
      
      const payload = {
        userId,
        groupId: selectedGroupId,
        description,
        amount: parseFloat(amount),
        paidBy: String(paidBy), // Ensure paidBy is a string
        sharedWith: formattedParticipants, // Array of user ID strings
      };

      console.log("✅ Expense Payload:", payload);
      const result = await addExpense(payload);
      console.log("✅ Expense added:", result);
      alert("Expense added successfully!");

      // Reset form
      setDescription("");
      setAmount("");
      setPaidBy("");
      setParticipants([]);
      setSelectedGroupId("");
    } catch (err) {
      console.error("❌ Error adding expense:", err);
      setError(`Failed to add expense: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-expense-page">
      <h2>Add New Expense</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-group">
          <label>Select Group:</label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            disabled={loading}
          >
            <option value="">Select Group</option>
            {groups.map((group) => (
              <option key={group._id || group.id} value={group._id || group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        {loading && <div className="loading-indicator">Loading group data...</div>}

        {selectedGroupId && !loading && groupUsers.length > 0 && (
          <>
            <div className="form-group">
              <label>Description:</label>
              <input
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter expense description"
              />
            </div>

            <div className="form-group">
              <label>Amount:</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                step="0.01"
                min="0.01"
              />
            </div>

            <div className="form-group">
              <label>Paid By:</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
              >
                <option value="">Select User</option>
                {groupUsers.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Select Participants:</label>
              <div className="participants-list">
                {groupUsers.map((user) => (
                  <div key={user._id} className="participant-item">
                    <input
                      type="checkbox"
                      id={`participant-${user._id}`}
                      checked={participants.includes(user._id)}
                      onChange={() => handleParticipantChange(user._id)}
                    />
                    <label htmlFor={`participant-${user._id}`}>
                      {user.email}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Adding..." : "Add Expense"}
            </button>
          </>
        )}

        {selectedGroupId && !loading && groupUsers.length === 0 && (
          <div className="no-users-message">
            No members found in this group. Please add members to the group first.
          </div>
        )}
      </form>
    </div>
  );
};

export default AddExpense;