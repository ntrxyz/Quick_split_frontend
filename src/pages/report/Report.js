import React, { useState, useEffect } from "react";
import "./Report.css";
import { FaFilter, FaFileInvoiceDollar } from "react-icons/fa";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import { useExpenseContext } from "../../context/ExpenseContext";
import { useTransaction } from "../../context/TransactionContext";

const Report = () => {
  const { expenses, loading: loadingExpenses } = useExpenseContext();
  const { transactions, loadingTransactions } = useTransaction();
  const currentUser = localStorage.getItem("userId");

  // Initialize balances
  let totalOwedToMeExpense = 0;
  let totalIOweExpense = 0;

  // Calculate balances from expenses
  expenses.forEach((expense) => {
    const numParticipants = expense.sharedWith ? expense.sharedWith.length + 1 : 1; // Payer + sharedWith
    const share = parseFloat(expense.amount) / numParticipants;

    if (expense.paidBy === currentUser) {
      totalOwedToMeExpense += parseFloat(expense.amount) - share;
    } else if (expense.sharedWith && expense.sharedWith.includes(currentUser)) {
      totalIOweExpense += share;
    }
  });

  // Initialize balances from transactions
  let transactionReceived = 0; // Settlements you received
  let transactionPaid = 0; // Settlements you paid

  transactions.forEach((tx) => {
    if (tx.payeeId === currentUser) {
      transactionReceived += Number(tx.amount);
    }
    if (tx.payerId === currentUser) {
      transactionPaid += Number(tx.amount);
    }
  });

  // Adjust balances using transactions
  const finalOwedToMe = totalOwedToMeExpense - transactionReceived;
  const finalIOwe = totalIOweExpense - transactionPaid;
  const finalBalance = finalOwedToMe - finalIOwe;

  // Prepare data for bar chart (expense growth)
  const monthlyData = {};
  expenses.forEach((exp) => {
    if (exp.createdAt) {
      const month = new Date(exp.createdAt).toLocaleString("default", { month: "short" });
      monthlyData[month] = (monthlyData[month] || 0) + parseFloat(exp.amount);
    }
  });
  const barLabels = Object.keys(monthlyData).length > 0
    ? Object.keys(monthlyData)
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const barValues = Object.keys(monthlyData).length > 0
    ? Object.values(monthlyData)
    : [500, 700, 1000, 1200, 800, 950, 1300];

  const barChartData = {
    labels: barLabels,
    datasets: [
      {
        label: "Expenses (₹)",
        data: barValues,
        backgroundColor: "rgba(0, 183, 255, 0.8)",
        borderColor: "rgba(0, 183, 255, 1)",
        borderWidth: 3,
        hoverBackgroundColor: "rgba(0, 255, 255, 1)",
        hoverBorderColor: "rgba(0, 255, 255, 1)",
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: "#fff" },
        grid: { color: "rgba(255, 255, 255, 0.2)" },
      },
      y: {
        ticks: { color: "#fff" },
        grid: { color: "rgba(255, 255, 255, 0.2)" },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  // Prepare data for pie chart (expense breakdown)
  const paidByYouCount = expenses.filter((exp) => exp.paidBy === currentUser).length;
  const sharedCount = expenses.filter(
    (exp) => exp.paidBy !== currentUser && exp.sharedWith.includes(currentUser)
  ).length;

  const pieChartData = {
    labels: ["Paid by You", "Shared Expense"],
    datasets: [
      {
        data: [paidByYouCount, sharedCount],
        backgroundColor: ["#4caf50", "#ffcc00"],
        borderColor: ["#2e7d32", "#b38f00"],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const pieChartOptions = {
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: { color: "#fff", font: { size: 14 } },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.7)",
        bodyColor: "#fff",
        titleColor: "#ffcc00",
        titleFont: { weight: "bold" },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="reports-container">
      <h2>Expense Reports</h2>
      <div className="summary-cards">
        <div className="card">
          <FaFileInvoiceDollar size={40} />
          <h3>Total Balance</h3>
          <p>₹{finalBalance.toFixed(2)}</p>
        </div>
        <div className="card">
          <FaFilter size={40} />
          <h3>You Owe</h3>
          <p>₹{finalIOwe.toFixed(2)}</p>
        </div>
        <div className="card">
          <FaFileInvoiceDollar size={40} />
          <h3>You Are Owed</h3>
          <p>₹{finalOwedToMe.toFixed(2)}</p>
        </div>
      </div>

      <div className="report-details">
        {/* Expense Growth (Bar Chart) */}
        <div className="chart-box">
          <h3>Expense Growth</h3>
          <div className="chart-container">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Expense Breakdown (Pie Chart) */}
        <div className="chart-box">
          <h3>Expense Breakdown</h3>
          <div className="chart-container">
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;