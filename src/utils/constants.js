// src/utils/constants.js

export const API_URL = import.meta.env.VITE_API_URL;
export const WS_URL = import.meta.env.VITE_WS_URL;

// User roles
export const ROLES = {
  USER: "user",
  RIDER: "courier",
  ADMIN: "admin",
};

// Order statuses
export const ORDER_STATUSES = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PENDING: "PENDING",
  ASSIGNED: "ASSIGNED",
  PICKED_UP: "PICKED_UP",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  DISPUTED: "DISPUTED",
};

// Payment statuses
export const PAYMENT_STATUSES = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
};

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "campusgo_access_token",
  REFRESH_TOKEN: "campusgo_refresh_token",
  USER: "campusgo_user",
};
