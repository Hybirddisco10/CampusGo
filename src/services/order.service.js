// src/services/order.service.js
import api from "./api";

/**
 * Create a new order
 */
export const createOrder = async (data) => {
  const response = await api.post("/orders", data);
  return response.data;
};

/**
 * Get all orders for current user
 */
export const getOrders = async (params = {}) => {
  const { status, limit = 20, offset = 0 } = params;
  const response = await api.get("/orders", {
    params: { status, limit, offset },
  });
  return response.data;
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

/**
 * Cancel an order
 */
export const cancelOrder = async (orderId, reason) => {
  const response = await api.post(`/orders/${orderId}/cancel`, { reason });
  return response.data;
};

/**
 * Rate an order (receiver only)
 */
export const rateOrder = async (orderId, data) => {
  const response = await api.post(`/orders/${orderId}/rate`, data);
  return response.data;
};

/**
 * Create a dispute for an order
 */
export const disputeOrder = async (orderId, reason) => {
  const response = await api.post(`/orders/${orderId}/dispute`, { reason });
  return response.data;
};
