import React, { useState } from "react";
import "./Dashboard.css";
import logo from "../../assets/logo.jpeg"; // App logo
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap for modal

const Dashboard = () => {
  const [expense, setExpense] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-container">
          <img src={logo} alt="App Logo" className="app-logo" />
          <h2>Quick-Split</h2>
        </div>
        <nav>
          <ul className="my-2">
            
            <li>Profile</li>
            <li className="active my-2">Dashboard</li>
            <li className="my-2">Recent Activity</li>
            <li className="my-2">All Expenses</li>
            <li className="my-2">Reports</li>
          </ul>
        </nav>
        <div className="groups">
          <h3>Groups</h3>
          <p>hfjfgh</p>
          <p>hfjfgh</p>
          <p>hfjfgh</p>
          <p>hfjfgh</p>
        </div>
       
      </aside>

      {/* Main Dashboard */}
      <main className="dashboard">
        <header>
          <h2>Dashboard</h2>
          <div>
            <button
              className="add-expense mx-2"
              data-bs-toggle="modal"
              data-bs-target="#expenseModal"
            >
              Add an Expense
            </button>
            <button className="settle-up mx-2">Settle Up</button>
            <button className="invite-btn mx-2">Add User to group</button>
          </div>
        </header>
        <div className="balance-summary">
          <p>
            Total Balance: <span className="positive">$302.00</span>
          </p>
          <p>
            You Owe: <span className="neutral">$5.00</span>
          </p>
          <p>
            You Are Owed: <span className="positive">$302.00</span>
          </p>
        </div>

        <div className="transactions">
          <h3>You Owe</h3>
          <p>You do not owe anything</p>

          <h3>You Are Owed</h3>
          <ul>
            <li>
              gfg <span className="owed">$26.00</span>
            </li>
            <li>
              gsdfg <span className="owed">$125.00</span>
            </li>
            <li>
              wgrefe <span className="owed">$151.00</span>
            </li>
          </ul>
        </div>
      </main>

      {/* Expense Modal */}
      <div
        className="modal fade"
        id="expenseModal"
        tabIndex="-1"
        aria-labelledby="expenseModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="expenseModalLabel">
                Add an Expense
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <label className="form-label">Description</label>
              <input
                type="text"
                className="form-control"
                value={expense.description}
                onChange={(e) =>
                  setExpense({ ...expense, description: e.target.value })
                }
              />

              <label className="form-label mt-3">Amount ($)</label>
              <input
                type="number"
                className="form-control"
                value={expense.amount}
                onChange={(e) =>
                  setExpense({ ...expense, amount: e.target.value })
                }
              />

              <p className="mt-3">
                Paid by <strong>You</strong> and split <strong>equally</strong>
              </p>

              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={expense.date}
                onChange={(e) =>
                  setExpense({ ...expense, date: e.target.value })
                }
              />

              <button className="btn btn-secondary mt-3">Add Image/Notes</button>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-danger"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button type="button" className="btn btn-success">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
