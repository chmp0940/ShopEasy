import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();

  if (location.pathname === "/") {
    if (!isAuthenticated) {
      return <Navigate to="/auth/login" />;
    } else {
      if (user?.role === "admin") {
        // Admin goes directly to admin dashboard
        return <Navigate to="/admin/dashboard" />;
      } else {
        // Regular users get the choice screen
        return <Navigate to="/choose-experience" />;
      }
    }
  }

  // 1. Not authenticated and not on login/register
  if (
    !isAuthenticated &&
    !(
      location.pathname.includes("/login") ||
      location.pathname.includes("/register")
    )
  ) {
    return <Navigate to="/auth/login" />;
  }

  // 2. All authenticated users can access /admin/* and /shop/*
  // Non-admins see admin pages in read-only mode (handled by admin components)

  // 3. Authenticated user on login/register — redirect based on role
  if (
    isAuthenticated &&
    (location.pathname.includes("/login") ||
      location.pathname.includes("/register"))
  ) {
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" />;
    } else {
      return <Navigate to="/choose-experience" />;
    }
  }

  // 4. Otherwise, render children
  return <>{children}</>;
}

export default CheckAuth;

