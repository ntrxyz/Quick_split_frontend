import React, { useState, useEffect } from "react";
import "./Report.css";
import { FaFilter, FaFileInvoiceDollar } from "react-icons/fa";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";

const Report = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    setTransactions([
      { id: 1, name: "John", amount: 25, status: "Pending" },
      { id: 2, name: "Emma", amount: 40, status: "Paid" },
      { id: 3, name: "Alice", amount: 60, status: "Pending" },
      { id: 4, name: "Mike", amount: 100, status: "Paid" },
      { id: 5, name: "Sophia", amount: 75, status: "Pending" },
    ]);
  }, []);

  // Bar Chart Data (Expense Growth)
  const barChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Expenses ($)",
        data: [500, 700, 1000, 1200, 800, 950, 1300],
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
      legend: {
        display: false,
      },
    },
  };

  // Pie Chart Data (Pending vs Paid)
  const pieChartData = {
    labels: ["Pending", "Paid"],
    datasets: [
      {
        data: [
          transactions.filter((t) => t.status === "Pending").length,
          transactions.filter((t) => t.status === "Paid").length,
        ],
        backgroundColor: ["#ffcc00", "#4caf50"],
        borderColor: ["#b38f00", "#2e7d32"],
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
        labels: {
          color: "#fff",
          font: { size: 14 },
        },
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
          <h3>Total Expenses</h3>
          <p>$1250</p>
        </div>
        <div className="card">
          <FaFilter size={40} />
          <h3>Pending Amount</h3>
          <p>$85</p>
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
