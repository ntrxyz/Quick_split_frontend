import React, { useContext, useEffect, useState } from "react";
import { GroupsContext } from "../../../context/GroupsContext";
import { getUserProfile, getUserByEmail } from "../../../services/userService";
import { addExpense } from "../../../services/ExpenseService";
import { getGroupById } from "../../../services/GroupService";
import "./AddExpense.css";
import { useExpenseContext } from "../../../context/ExpenseContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS

const AddExpense = () => {
  const { groups } = useContext(GroupsContext);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [groupUsers, setGroupUsers] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
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
        toast.error("Failed to load group members. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [selectedGroupId]);

  const handleParticipantChange = (email) => {
    setParticipants((prev) =>
      prev.includes(email)
        ? prev.filter((item) => item !== email)
        : [...prev, email]
    );
  };

  const convertEmailToUserId = async (email) => {
    try {
      const user = await getUserByEmail(email);
      return user._id || user.id || user.userId;
    } catch (error) {
      console.error(`Error converting email ${email} to user id:`, error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedGroupId || !description || !amount || !paidBy || participants.length === 0) {
      toast.error("Please fill in all fields and select at least one participant.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("You are not logged in. Please log in and try again.");
        return;
      }

      const payerId = await convertEmailToUserId(paidBy);

      const convertedParticipants = await Promise.all(
        participants.map((email) => convertEmailToUserId(email))
      );
      const validParticipants = convertedParticipants.filter((id) => id);

      const sharedWith = validParticipants.includes(payerId)
        ? validParticipants
        : [...validParticipants, payerId];

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

      const expenseToStore = {
        id: result._id || result.id,
        userId: result.userId,
        groupId: result.groupId,
        description: result.description,
        amount: result.amount,
        paidBy: payload.paidBy,
        sharedWith: payload.sharedWith,
      };

      console.log("✅ Transformed Expense:", expenseToStore);
      toast.success("Expense added successfully!");

      await fetchExpenses();

      setDescription("");
      setAmount("");
      setPaidBy("");
      setParticipants([]);
      setSelectedGroupId("");
    } catch (err) {
      console.error("❌ Error adding expense:", err);
      toast.error(`Failed to add expense: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
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

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={1000} />
    </div>
  );
};

export default AddExpense;