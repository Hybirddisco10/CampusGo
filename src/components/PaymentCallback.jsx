// src/components/PaymentCallback.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { verifyPayment, getPaymentStatus } from "../services/payment.service";
import { getOrderById } from "../services/order.service";
import LoadingSpinner from "./LoadingSpinner";
import toast from "react-hot-toast";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const [status, setStatus] = useState("verifying"); // verifying | success | failed | not_found
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  const verifyPaymentFlow = async (ref, isRetry = false) => {
    if (!ref) {
      setStatus("not_found");
      setMessage(
        "No payment reference found. Please check your payment status from the dashboard."
      );
      return;
    }

    try {
      // First, verify with the backend
      const result = await verifyPayment(ref);

      if (result.success && result.data.status === "PAID") {
        setStatus("success");
        setOrderId(result.data.orderId);
        setMessage(`Payment of GH₵ ${result.data.amount} confirmed!`);
        toast.success("Payment successful!");
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate("/user-dashboard");
        }, 3000);
        return;
      }

      // If verification says not paid, we might still wait for webhook
      // Check if order exists with that reference
      // We can poll the order status
      if (!isRetry) {
        // Start polling for status
        let attempts = 0;
        const maxAttempts = 5;
        const interval = 2000; // 2 seconds

        const pollInterval = setInterval(async () => {
          attempts++;
          setPollCount(attempts);
          try {
            // Try to get the order using the reference (maybe we know orderId from metadata)
            // Since we don't have orderId, we can try to fetch all orders? Not efficient.
            // Better: we stored orderId in metadata, but we don't have it. We can fetch using reference from the backend if there's an endpoint.
            // For now, we can assume the backend returns orderId in the verification response.
            // The verifyPayment response already returns orderId if payment was successful.
            // If it returned 'PAID', we would have already succeeded.
            // So if we are here, it's not PAID, maybe PENDING.
            // Let's check again with verifyPayment.
            const retryResult = await verifyPayment(ref);
            if (retryResult.success && retryResult.data.status === "PAID") {
              clearInterval(pollInterval);
              setStatus("success");
              setOrderId(retryResult.data.orderId);
              setMessage(
                `Payment of GH₵ ${retryResult.data.amount} confirmed!`
              );
              toast.success("Payment confirmed!");
              setTimeout(() => {
                navigate("/user-dashboard");
              }, 3000);
              return;
            }
            if (attempts >= maxAttempts) {
              clearInterval(pollInterval);
              // Still not paid – let user decide
              setStatus("failed");
              setMessage(
                "Payment confirmation is taking longer than expected. Your order may still be processing. You can check later from your dashboard."
              );
            }
          } catch (error) {
            clearInterval(pollInterval);
            setStatus("failed");
            setMessage("Error verifying payment. Please try again later.");
          }
        }, interval);
      } else {
        // Retry manually
        setStatus("failed");
        setMessage(
          "Payment could not be verified. Please try again or check your order status later."
        );
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setStatus("failed");
      setMessage(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  useEffect(() => {
    verifyPaymentFlow(reference);
  }, [reference]);

  const handleRetry = () => {
    setIsRetrying(true);
    verifyPaymentFlow(reference, true);
    setIsRetrying(false);
  };

  // Render
  if (status === "verifying") {
    return (
      <div
        className="min-h-screen bg-white flex items-center justify-center px-6"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="text-center max-w-md w-full">
          <LoadingSpinner size="w-16 h-16" color="border-[#eab308]" />
          <h2 className="text-2xl font-bold text-[#0f2e1c] mt-6">
            Verifying Payment...
          </h2>
          <p className="text-sm text-[#5c7768] mt-2">
            {pollCount > 0
              ? `Attempt ${pollCount} of 5...`
              : "Please wait while we confirm your payment."}
          </p>
          <p className="text-xs text-[#a8b5ae] mt-4">
            Do not close this window.
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div
        className="min-h-screen bg-white flex items-center justify-center px-6"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="text-center max-w-md w-full">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600">
            Payment Successful!
          </h2>
          <p className="text-sm text-[#5c7768] mt-2">{message}</p>
          <p className="text-xs text-[#a8b5ae] mt-4">
            Redirecting to dashboard...
          </p>
          <Link
            to="/user-dashboard"
            className="mt-6 inline-block bg-[#eab308] hover:bg-[#ca8a04] text-[#14291d] px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div
        className="min-h-screen bg-white flex items-center justify-center px-6"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="text-center max-w-md w-full">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-orange-600">
            Payment Verification Pending
          </h2>
          <p className="text-sm text-[#5c7768] mt-2">{message}</p>
          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="bg-[#eab308] hover:bg-[#ca8a04] text-[#14291d] px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50"
            >
              {isRetrying ? "Retrying..." : "Retry Verification"}
            </button>
            <Link
              to="/user-dashboard"
              className="text-[#15803d] hover:text-[#166534] text-sm underline"
            >
              Return to Dashboard
            </Link>
            <p className="text-xs text-[#a8b5ae] mt-2">
              If you completed payment, it may take a few minutes to reflect.
              You can also check your order status from the dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "not_found") {
    return (
      <div
        className="min-h-screen bg-white flex items-center justify-center px-6"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="text-center max-w-md w-full">
          <div className="text-6xl mb-4">❓</div>
          <h2 className="text-2xl font-bold text-red-600">
            No Payment Reference
          </h2>
          <p className="text-sm text-[#5c7768] mt-2">{message}</p>
          <Link
            to="/user-dashboard"
            className="mt-6 inline-block bg-[#eab308] hover:bg-[#ca8a04] text-[#14291d] px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return null;
};

export default PaymentCallback;
