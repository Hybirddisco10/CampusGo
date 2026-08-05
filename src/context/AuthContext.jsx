// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import * as authService from "../services/auth.service";
import { STORAGE_KEYS } from "../utils/constants";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        try {
          const response = await authService.getCurrentUser();
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          // Token invalid or expired
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Login
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { token, refreshToken, data } = response;

      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data));

      setUser(data);
      setIsAuthenticated(true);
      toast.success(`Welcome back, ${data.name}!`);

      // Redirect based on role
      if (data.role === "ADMIN") {
        navigate("/admin-dashboard");
      } else if (data.role === "RIDER") {
        navigate("/rider-dashboard");
      } else {
        navigate("/user-dashboard");
      }
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Registration flow: initiate (send OTP)
  const initiateRegistration = async (userData) => {
    try {
      const response = await authService.initiateRegistration(userData);
      toast.success("OTP sent to your email. Please check your inbox.");
      return { success: true, data: response.data };
    } catch (error) {
      const message =
        error.response?.data?.message || "Registration initiation failed.";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Verify OTP and complete registration
  const verifyRegistration = async (payload) => {
    try {
      const response = await authService.verifyRegistration(payload);
      const { token, refreshToken, data } = response;

      if (data.role === "RIDER" && !data.isActive) {
        toast.success("Application submitted. You can sign in after admin approval.");
        return { success: true, data, pendingApproval: true };
      }

      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data));

      setUser(data);
      setIsAuthenticated(true);
      toast.success("Registration successful!");

      // Redirect
      if (data.role === "ADMIN") {
        navigate("/admin-dashboard");
      } else if (data.role === "RIDER") {
        navigate("/rider-dashboard");
      } else {
        navigate("/user-dashboard");
      }
      return { success: true, data };
    } catch (error) {
      const message = error.response?.data?.message || "Verification failed.";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Resend OTP
  const resendOtp = async (email) => {
    try {
      await authService.resendOtp(email);
      toast.success("New OTP sent to your email.");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to resend OTP.";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const response = await authService.forgotPassword(email);
      toast.success("Password reset OTP sent to your email.");
      return { success: true, data: response.data };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to send reset link.";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Reset password
  const resetPassword = async (email, otp, newPassword) => {
    try {
      await authService.resetPassword({ email, otp, newPassword });
      toast.success("Password reset successful. Please login.");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Password reset failed.";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // ignore logout errors
    } finally {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      setUser(null);
      setIsAuthenticated(false);
      toast.success("Logged out successfully.");
      navigate("/");
    }
  };

  // Update user profile (local state after updates)
  const updateUser = (data) => {
    setUser((prev) => ({ ...prev, ...data }));
    localStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify({ ...user, ...data })
    );
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    initiateRegistration,
    verifyRegistration,
    resendOtp,
    forgotPassword,
    resetPassword,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
