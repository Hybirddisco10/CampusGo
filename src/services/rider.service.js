// src/services/rider.service.js
import api from "./api";

/**
 * Get available orders for rider
 */
export const getAvailableOrders = async (params = {}) => {
  const { lat, lng, radius } = params;
  const response = await api.get("/riders/available-orders", {
    params: { lat, lng, radius },
  });
  return response.data;
};

/**
 * Accept an order
 */
export const acceptOrder = async (orderId) => {
  const response = await api.post(`/riders/orders/${orderId}/accept`);
  return response.data;
};

/**
 * Update order status (PICKED_UP, IN_TRANSIT)
 */
export const updateOrderStatus = async (orderId, status) => {
  const response = await api.patch(`/riders/orders/${orderId}/status`, {
    status,
  });
  return response.data;
};

/**
 * Confirm delivery with OTP
 */
export const confirmDelivery = async (orderId, otp) => {
  const response = await api.post(
    `/riders/orders/${orderId}/confirm-delivery`,
    { otp }
  );
  return response.data;
};

/**
 * Update rider location
 */
export const updateLocation = async (lat, lng) => {
  const response = await api.patch("/riders/location", { lat, lng });
  return response.data;
};

/**
 * Toggle rider availability
 */
export const toggleAvailability = async (available) => {
  const response = await api.patch("/riders/availability", { available });
  return response.data;
};

/**
 * Get rider earnings
 */
export const getEarnings = async (period = "week") => {
  const response = await api.get("/riders/earnings", {
    params: { period },
  });
  return response.data;
};

/**
 * Get rider order history
 */
export const getRiderHistory = async (params = {}) => {
  const { limit = 20, offset = 0 } = params;
  const response = await api.get("/riders/history", {
    params: { limit, offset },
  });
  return response.data;
};
