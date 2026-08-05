// src/services/auth.service.js
import api from "./api";

/**
 * Initiate registration - sends OTP to email
 */
export const initiateRegistration = async (data) => {
  const response = await api.post("/auth/register/initiate", data);
  return response.data;
};

/**
 * Verify registration - completes account creation
 */
export const verifyRegistration = async (data) => {
  // Do not set Content-Type here: Axios supplies the multipart boundary for FormData.
  const response = await api.post("/auth/register/verify", data);
  return response.data;
};

/**
 * Resend registration OTP
 */
export const resendOtp = async (email) => {
  const response = await api.post("/auth/register/resend-otp", { email });
  return response.data;
};

/**
 * Login user
 */
export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

/**
 * Refresh JWT token
 */
export const refreshToken = async (refreshToken) => {
  const response = await api.post("/auth/refresh", { refreshToken });
  return response.data;
};

/**
 * Forgot password - sends reset OTP
 */
export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

/**
 * Reset password with OTP
 */
export const resetPassword = async (data) => {
  const response = await api.post("/auth/reset-password", data);
  return response.data;
};

/**
 * Logout user
 */
export const logout = async (fcmToken = null) => {
  const response = await api.post("/auth/logout", { fcmToken });
  return response.data;
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

/**
 * Admin registration (requires secret key)
 */
export const registerAdmin = async (data) => {
  const response = await api.post("/auth/register/admin", data);
  return response.data;
};
