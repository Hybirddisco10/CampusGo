// src/services/admin.service.js
import api from "./api";

/**
 * Get admin dashboard statistics
 * @param {string} period - 'today', 'week', 'month'
 */
export const getAdminStats = async (period = "week") => {
  const response = await api.get("/admin/stats", { params: { period } });
  return response.data;
};

/**
 * Get all orders (admin)
 * @param {Object} params - { status, limit, offset }
 */
export const getAllOrdersAdmin = async (params = {}) => {
  const response = await api.get("/admin/orders", { params });
  return response.data;
};

/**
 * Get all users (admin)
 * @param {Object} params - { role, is_active, limit, offset }
 */
export const getAllUsersAdmin = async (params = {}) => {
  const response = await api.get("/admin/users", { params });
  return response.data;
};

/**
 * Get all riders (admin)
 * @param {Object} params - { status, limit, offset } // status: PENDING, APPROVED, REJECTED
 */
export const getAllRidersAdmin = async (params = {}) => {
  const response = await api.get("/admin/riders", { params });
  return response.data;
};

/**
 * Approve/Reject rider application
 * @param {string} riderId - courier_id
 * @param {string} status - 'APPROVED' or 'REJECTED'
 * @param {string} notes - optional admin notes
 */
export const updateRiderStatus = async (riderId, status, notes = "") => {
  const response = await api.patch(`/admin/riders/${riderId}/status`, {
    status,
    notes,
  });
  return response.data;
};

/**
 * Suspend/Activate rider account
 * @param {string} riderId - courier_id
 * @param {boolean} is_active - true to activate, false to suspend
 */
export const activateRider = async (riderId, is_active) => {
  const response = await api.patch(`/admin/riders/${riderId}/activate`, {
    is_active,
  });
  return response.data;
};

/**
 * Suspend/Activate user account
 * @param {string} userId - user_id
 * @param {boolean} is_active - true to activate, false to suspend
 */
export const updateUserStatusAdmin = async (userId, is_active) => {
  const response = await api.patch(`/admin/users/${userId}/status`, {
    is_active,
  });
  return response.data;
};

/**
 * Get disputes (admin)
 */
export const getDisputes = async () => {
  const response = await api.get("/admin/disputes");
  return response.data;
};
