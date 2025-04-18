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
import ExpenseDetails from "./pages/expenses/expensedetails/ExpenseDetails";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentSuccess from "./pages/transactions/success-payment/PaymentSuccess";
import { TransactionProvider } from "./context/TransactionContext";
import AllTransactions from "./pages/transactions/alltransactions/AllTransactions";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);


const App = () => {
  return (
    <Elements stripe={stripePromise}>
      <TransactionProvider>
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
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/transactions" element={<AllTransactions/>} />

      </Routes>
    </Router>
    </GroupsProvider>
    </ExpenseProvider>
    </TransactionProvider>
    </Elements>
  );
};

export default App;
