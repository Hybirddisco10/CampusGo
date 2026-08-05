// src/services/payment.service.js
import api from "./api";

/**
 * Initialize payment with Paystack
 */
export const initializePayment = async (data) => {
  const { orderId, email } = data;
  const response = await api.post("/payments/initialize", { orderId, email });
  return response.data;
};

/**
 * Verify payment by reference
 */
export const verifyPayment = async (reference) => {
  const response = await api.get(`/payments/verify/${reference}`);
  return response.data;
};

/**
 * Get payment status for an order
 */
export const getPaymentStatus = async (orderId) => {
  const response = await api.get(`/payments/${orderId}`);
  return response.data;
};
