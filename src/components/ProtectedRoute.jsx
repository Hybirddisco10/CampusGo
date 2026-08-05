// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner";

/**
 * ProtectedRoute component
 * Redirects to /signin if user is not authenticated.
 * Optionally checks for allowed roles.
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Wait for auth state to load
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  // Not authenticated → redirect to sign in
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Role-based access control (if allowedRoles provided)
  if (allowedRoles.length > 0) {
    const userRole = user?.role || "";
    const hasAccess = allowedRoles.some(
      (role) => userRole.toUpperCase() === role.toUpperCase()
    );
    if (!hasAccess) {
      // Redirect to appropriate dashboard based on role
      if (userRole === "RIDER") {
        return <Navigate to="/rider-dashboard" replace />;
      }
      return <Navigate to="/user-dashboard" replace />;
    }
  }

  // Authenticated → render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
