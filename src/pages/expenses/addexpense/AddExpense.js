import React, { useContext, useEffect, useState } from "react";
import { GroupsContext } from "../../../context/GroupsContext";
import { getUserProfile } from "../../../services/userService";
import { addExpense } from "../../../services/ExpenseService";
import { getGroupById } from "../../../services/GroupService"; // ✅ Use service instead of raw axios
import "./AddExpense.css";

const AddExpense = () => {
  const { groups } = useContext(GroupsContext);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [groupUsers, setGroupUsers] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [participants, setParticipants] = useState([]);

  // ✅ Fetch group details when selected group changes
  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!selectedGroupId) return;

      try {
        // Fetch group data
        const groupData = await getGroupById(selectedGroupId);
        // Get the user profiles for all group members
        const userProfiles = await Promise.all(
          groupData.members.map((userId) => getUserProfile(userId))
        );

        setGroupUsers(userProfiles);
        setPaidBy(""); // Clear "Paid By" field when group changes
        setParticipants([]); // Clear previous participants
      } catch (err) {
        console.error("Error fetching group users:", err);
      }
    };

    fetchGroupDetails();
  }, [selectedGroupId]);

  const handleParticipantChange = (userId) => {
    setParticipants((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };
  
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !selectedGroupId ||
      !title ||
      !amount ||
      !paidBy ||
      participants.length === 0
    ) {
      alert("Please fill in all fields and select at least one participant.");
      return;
    }

    const payload = {
      groupId: selectedGroupId,
      title,
      amount,
      paidBy,
      participants,
    };

    try {
      await addExpense(payload);

      alert("Expense added successfully!");
      setTitle("");
      setAmount("");
      setPaidBy("");
      setParticipants([]);
      setSelectedGroupId("");
      setGroupUsers([]);
    } catch (err) {
      console.error("Error adding expense", err);
      alert("Failed to add expense");
    }
  };

  return (
    <div className="add-expense-page">
      <h2>Add New Expense</h2>
      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-group">
          <label>Select Group:</label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
          >
            <option value="">Select Group</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        {selectedGroupId && (
          <>
            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter expense title"
              />
            </div>

            <div className="form-group">
              <label>Amount:</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
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
                    {user.username} ({user.email})
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
 <label htmlFor={`participant-${user._id}`} className="participant-label">
   <span className="participant-name mx-2">{user.name}:</span>
   <span className="participant-email">({user.email})</span>
 </label>
</div>

    ))}
  </div>
</div>


            <button type="submit" className="submit-btn">
              Add Expense
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default AddExpense;
