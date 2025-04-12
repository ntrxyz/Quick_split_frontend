import React, { useContext, useEffect, useState } from "react";
import { GroupsContext } from "../../../context/GroupsContext";
import { getUserProfile, getUserByEmail } from "../../../services/userService";
import { addExpense } from "../../../services/ExpenseService";
import { getGroupById } from "../../../services/GroupService";
import "./AddExpense.css";
import { useExpenseContext } from "../../../context/ExpenseContext";

const AddExpense = () => {
  const { groups } = useContext(GroupsContext);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [groupUsers, setGroupUsers] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  // We now store the selected user's email from the dropdown.
  const [paidBy, setPaidBy] = useState("");
  // Participants are stored as emails too.
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { fetchExpenses } = useExpenseContext();

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

        // Fetch each member's profile. (We assume the returned object includes an email.)
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

  // Toggle participant selection based on email value.
  const handleParticipantChange = (email) => {
    setParticipants((prev) =>
      prev.includes(email)
        ? prev.filter((item) => item !== email)
        : [...prev, email]
    );
  };

  // Convert an email to a user ID using the getUserByEmail service.
  const convertEmailToUserId = async (email) => {
    try {
      const user = await getUserByEmail(email);
      // Use whichever property the user object returns.
      return user._id || user.id || user.userId;
    } catch (error) {
      console.error(`Error converting email ${email} to user id:`, error);
      return null;
    }
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

      // Convert the payer's email to a proper user ID.
      const payerId = await convertEmailToUserId(paidBy);

      // Convert each participant email to its user ID.
      const convertedParticipants = await Promise.all(
        participants.map((email) => convertEmailToUserId(email))
      );
      // Filter out any unsuccessful conversions.
      const validParticipants = convertedParticipants.filter((id) => id);

      // Ensure that the payer's ID is included.
      const sharedWith = validParticipants.includes(payerId)
        ? validParticipants
        : [...validParticipants, payerId];

      // Build the payload using user IDs.
      const payload = {
        userId,
        groupId: selectedGroupId,
        description,
        amount: parseFloat(amount),
        paidBy: payerId,
        sharedWith,
      };

      console.log("✅ Expense Payload:", payload);
      const result = await addExpense(payload);
      console.log("✅ Expense added (raw response):", result);

      // Optionally override any populated values (like email) from the backend with our payload values.
      const expenseToStore = {
        id: result._id || result.id,
        userId: result.userId,
        groupId: result.groupId,
        description: result.description,
        amount: result.amount,
        paidBy: payload.paidBy,            // ensures user ID is used
        sharedWith: payload.sharedWith,    // ensures user IDs array is used
      };

      console.log("✅ Transformed Expense:", expenseToStore);
      alert("Expense added successfully!");

      await fetchExpenses();

      // Reset the form
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
              <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
                <option value="">Select User</option>
                {groupUsers.map((user) => (
                  // Use the user's email as the value so we can later convert it to an ID.
                  <option key={user.email} value={user.email}>
                    {user.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Select Participants:</label>
              <div className="participants-list">
                {groupUsers.map((user) => (
                  <div key={user.email} className="participant-item">
                    <input
                      type="checkbox"
                      id={`participant-${user.email}`}
                      checked={participants.includes(user.email)}
                      onChange={() => handleParticipantChange(user.email)}
                    />
                    <label htmlFor={`participant-${user.email}`}>{user.email}</label>
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