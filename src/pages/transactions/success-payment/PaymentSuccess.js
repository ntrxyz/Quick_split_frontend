import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { recordPayment } from "../../../services/TransactionService";
import "./PaymentSuccess.css";

const PaymentSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // This ref will guard against recording the payment more than once.
  const hasRecordedPaymentRef = useRef(false);

  useEffect(() => {
    const createTransaction = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const sessionId = queryParams.get("session_id");
  
        if (!sessionId) {
          setError("Missing payment session information");
          setLoading(false);
          return;
        }
  
        // 🔐 Step 1: Check if this session was already recorded
        const recordedSessions = JSON.parse(localStorage.getItem("recordedStripeSessions")) || [];
        if (recordedSessions.includes(sessionId)) {
          console.log("Transaction already recorded for this session.");
          setSuccess(true);
          setLoading(false);
          return;
        }
  
        const storedPayment = localStorage.getItem("pendingPayment");
        if (!storedPayment) {
          console.log("No pending payment found – probably already processed.");
          setSuccess(true);
          setLoading(false);
          return;
        }
        const paymentDetails = JSON.parse(storedPayment);
  
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("Authentication error. Please log in again.");
          setLoading(false);
          return;
        }
  
        if (hasRecordedPaymentRef.current) {
          console.log("Payment already recorded in this session.");
          setSuccess(true);
          setLoading(false);
          return;
        }
  
        const transactionData = {
          expenseId: paymentDetails.expenseId,
          payerId: localStorage.getItem("userId"),
          payeeId: paymentDetails.payeeId,
          amount: paymentDetails.amount,
          stripeSessionId: sessionId,
          paymentMethod: "stripe",
          groupId: paymentDetails.groupId
        };
  
        console.log("Sending transaction data:", transactionData);
        await recordPayment(transactionData);
  
        // ✅ Step 2: Mark as recorded
        hasRecordedPaymentRef.current = true;
        localStorage.removeItem("pendingPayment");
  
        // ✅ Step 3: Save session ID to prevent re-recording on reload
        recordedSessions.push(sessionId);
        localStorage.setItem("recordedStripeSessions", JSON.stringify(recordedSessions));
  
        setSuccess(true);
        setLoading(false);
      } catch (err) {
        console.error("Error recording transaction:", err);
        if (err.response) {
          if (err.response.status === 403) {
            setError("Permission denied. You may need to log in again.");
          } else {
            setError(`Server error: ${err.response.status}. Please contact support.`);
          }
        } else {
          setError("Failed to record your payment. Please contact support.");
        }
        setLoading(false);
      }
    };
  
    createTransaction();
  }, [location.search]);
  

  const handleGoBack = () => {
    navigate("/dashboard?tab=expenses");
  };

  if (loading) {
    return (
      <div className="payment-status-container">
        <div className="payment-status-box">
          <div className="spinner"></div>
          <h2>Processing your payment...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-status-container">
        <div className="payment-status-box error">
          <h2>Payment Error</h2>
          <p>{error}</p>
          <button onClick={handleGoBack} className="back-button">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-status-container">
      <div className="payment-status-box success">
        <div className="success-icon">✓</div>
        <h2>Payment Successful!</h2>
        <p>Your payment has been processed and recorded successfully.</p>
        <button onClick={handleGoBack} className="back-button">
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;