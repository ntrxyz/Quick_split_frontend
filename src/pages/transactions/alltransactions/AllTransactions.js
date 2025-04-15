import React, { useEffect, useState } from "react";
import { useTransaction } from "../../../context/TransactionContext";
import { getGroupById } from "../../../services/GroupService";
import { getUserProfile } from "../../../services/userService";
import "./AllTransactions.css"; // optional styling

const AllTransactions = () => {
  const { transactions, loadingTransactions, error } = useTransaction();
  const [groupMap, setGroupMap] = useState({});
  const [userMap, setUserMap] = useState({});

  // Fetch group names for each unique groupId in transactions.
  useEffect(() => {
    if (transactions && transactions.length) {
      const uniqueGroupIds = Array.from(
        new Set(transactions.map((tx) => tx.groupId))
      );
      Promise.all(uniqueGroupIds.map((id) => getGroupById(id)))
        .then((groups) => {
          const map = {};
          groups.forEach((group) => {
            // Use group._id or group.id depending on your backend response.
            map[group._id || group.id] = group.name;
          });
          setGroupMap(map);
        })
        .catch((error) => console.error("Error fetching groups:", error));
    }
  }, [transactions]);

  // Fetch user profiles for each unique userId (payer and payee) in transactions.
  useEffect(() => {
    if (transactions && transactions.length) {
      const userIds = new Set();
      transactions.forEach((tx) => {
        if (tx.payerId) userIds.add(tx.payerId);
        if (tx.payeeId) userIds.add(tx.payeeId);
      });
      Promise.all(Array.from(userIds).map((id) => getUserProfile(id)))
        .then((users) => {
          const map = {};
          users.forEach((user) => {
            // Map user id to a display name (using name if available; fallback to email)
            map[user._id || user.id] = user.name || user.email;
          });
          setUserMap(map);
        })
        .catch((error) =>
          console.error("Error fetching user profiles:", error)
        );
    }
  }, [transactions]);

  if (loadingTransactions) return <p>Loading transactions...</p>;
  if (error) return <p>{error}</p>;
  if (!transactions.length) return <p className="no-transactions">No transactions found.</p>;

  return (
    <div className="all-transactions">
      <h2>All Transactions</h2>
      <table>
        <thead>
          <tr>
            <th>Group</th>
            <th>Amount</th>
            <th>Payer</th>
            <th>Payee</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{groupMap[tx.groupId] || tx.groupId}</td>
              <td>₹{tx.amount.toFixed(2)}</td>
              <td>{userMap[tx.payerId] || tx.payerId}</td>
              <td>{userMap[tx.payeeId] || tx.payeeId}</td>
              <td>{new Date(tx.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllTransactions;