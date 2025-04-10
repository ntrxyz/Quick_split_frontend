import React, { useEffect, useState } from "react";
import { getExpensesByUser } from "../../../services/ExpenseService";
import "./AllExpenses.css"; // Styling file

const AllExpenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const data = await getExpensesByUser();
                setExpenses(data);
            } catch (error) {
                console.error("Error fetching expenses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchExpenses();
    }, []);

    return (
        <div className="expenses-container">
            <h2>Your Expenses</h2>
            {loading ? (
                <p>Loading expenses...</p>
            ) : expenses.length === 0 ? (
                <p>No expenses found.</p>
            ) : (
                <div className="expenses-grid">
                    {expenses.map((expense) => (
                        <div key={expense._id} className="expense-card">
                            <h3>{expense.title}</h3>
                            <p><strong>Amount:</strong> ₹{expense.amount}</p>
                            <p><strong>Paid By:</strong> {expense.paidBy?.username || "N/A"}</p>
                            <p><strong>Group:</strong> {expense.groupName || "N/A"}</p>
                            <p><strong>Date:</strong> {new Date(expense.createdAt).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllExpenses;
