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


const App = () => {
  return (
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
      </Routes>
    </Router>
    </GroupsProvider>
  );
};

export default App;
