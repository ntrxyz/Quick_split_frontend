import React, { useState, useEffect } from "react";
import "./Report.css";
import { FaFilter, FaChartPie, FaFileInvoiceDollar } from "react-icons/fa";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";

const Report = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    setTransactions([
      { id: 1, name: "John", amount: 25, status: "Pending" },
      { id: 2, name: "Emma", amount: 40, status: "Paid" },
      { id: 3, name: "Alice", amount: 60, status: "Pending" },
    ]);
  }, []);

  const chartData = {
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

  const chartOptions = {
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
        <div className="chart-box">
          <h3>Expense Breakdown</h3>
          <div className="chart-container">
            <Pie data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="transaction-table">
          <h3>Transaction History</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className={tx.status.toLowerCase()}>
                  <td>{tx.name}</td>
                  <td>${tx.amount}</td>
                  <td>{tx.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Report;
