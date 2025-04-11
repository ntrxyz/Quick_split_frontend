import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import Dashboard from "./pages/dashboard/Dashboard";
import Groups from "./pages/groups/Groups";
import CreateGroup from "./pages/groups/CreateGroup";
import { GroupsProvider } from "./context/GroupsContext";
import GroupDetails from "./pages/groups/GroupDetails";
import { ExpenseProvider } from "./context/ExpenseContext";
import ExpenseDetails from "./pages/expenses/expensedetails/ExpenseDetails"


const App = () => {
  return (
    <ExpenseProvider>
    <GroupsProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<SignUp/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/new" element={<CreateGroup />} />
        <Route path="/groups/:id" element={<GroupDetails />} />
        <Route path="/expenses/:expenseId" element={<ExpenseDetails />} />

      </Routes>
    </Router>
    </GroupsProvider>
    </ExpenseProvider>
  );
};

export default App;
