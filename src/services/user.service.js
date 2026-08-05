// src/services/user.service.js
import api from "./api";

/**
 * Get user profile
 */
export const getProfile = async () => {
  const response = await api.get("/users/profile");
  return response.data;
};

/**
 * Update user profile
 */
export const updateProfile = async (data) => {
  const response = await api.put("/users/profile", data);
  return response.data;
};

/**
 * Upload profile image (multipart/form-data)
 */
export const uploadProfileImage = async (formData) => {
  const response = await api.post("/users/profile/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

/**
 * Delete profile image
 */
export const deleteProfileImage = async () => {
  const response = await api.delete("/users/profile/image");
  return response.data;
};

/**
 * Get notification settings
 */
export const getNotificationSettings = async () => {
  const response = await api.get("/users/notifications");
  return response.data;
};

/**
 * Update notification settings
 */
export const updateNotificationSettings = async (data) => {
  const response = await api.put("/users/notifications", data);
  return response.data;
};

/**
 * Get delivery history
 */
export const getDeliveryHistory = async (params = {}) => {
  const { status, limit = 20, offset = 0 } = params;
  const response = await api.get("/users/deliveries", {
    params: { status, limit, offset },
  });
  return response.data;
};

/**
 * Rider onboarding (existing user applies to become rider)
 * Multipart/form-data with documents
 */
export const riderOnboard = async (formData) => {
  const response = await api.post("/users/rider/onboard", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
