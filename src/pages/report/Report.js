import React, { useState, useEffect } from "react";
import "./Report.css";
import { FaFilter, FaFileInvoiceDollar } from "react-icons/fa";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import { useExpenseContext } from "../../context/ExpenseContext";

const Report = () => {
  // Get expenses and loading flag from the ExpenseContext
  const { expenses, loading } = useExpenseContext();
  // Retrieve current user's ID from local storage
  const currentUser = localStorage.getItem("userId");

  /** 
   * Calculation of Summary:
   *
   * - For each expense, we assume the expense is split equally among all members in its "sharedWith" array.
   * - If the current user is the payer, then the extra amount (total amount minus one share) is what
   *   others owe you (i.e. "You Are Owed").
   * - If the current user is not the payer (but is in the sharedWith array), then you owe your equal share.
   */
  let totalOwedToMe = 0; // Amount others owe you (for expenses you paid)
  let totalIOwe = 0;     // Amount you owe (for shared expenses where you didn't pay)

  expenses.forEach((exp) => {
    if (exp.sharedWith && exp.sharedWith.length > 0 && exp.amount) {
      const share = parseFloat(exp.amount) / exp.sharedWith.length;
      if (exp.paidBy === currentUser) {
        totalOwedToMe += parseFloat(exp.amount) - share;
      } else if (exp.sharedWith.includes(currentUser)) {
        totalIOwe += share;
      }
    }
  });

  // Net balance: positive means you are owed, negative means you owe.
  const totalBalance = totalOwedToMe - totalIOwe;

  /**
   * Bar Chart Data: Expense Growth.
   *
   * If each expense had a "createdAt" property, a grouping by month would be possible.
   * Otherwise, this example will fall back to dummy data.
   */
  const monthlyData = {};
  expenses.forEach((exp) => {
    if (exp.createdAt) {
      const month = new Date(exp.createdAt).toLocaleString("default", { month: "short" });
      monthlyData[month] = (monthlyData[month] || 0) + parseFloat(exp.amount);
    }
  });
  const barLabels =
    Object.keys(monthlyData).length > 0
      ? Object.keys(monthlyData)
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const barValues =
    Object.keys(monthlyData).length > 0 ? Object.values(monthlyData) : [500, 700, 1000, 1200, 800, 950, 1300];

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

  /**
   * Pie Chart: Expense Breakdown.
   *
   * For the pie chart, we use the counts of expenses where:
   * - "Paid by You": expenses where the current user is the payer.
   * - "Shared Expense": expenses where the current user is NOT the payer but is included in sharedWith.
   */
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
          <p>₹{totalBalance.toFixed(2)}</p>
        </div>
        <div className="card">
          <FaFilter size={40} />
          <h3>You Owe</h3>
          <p>₹{totalIOwe.toFixed(2)}</p>
        </div>
        <div className="card">
          <FaFileInvoiceDollar size={40} />
          <h3>You Are Owed</h3>
          <p>₹{totalOwedToMe.toFixed(2)}</p>
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