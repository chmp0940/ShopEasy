import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();

  if (location.pathname === "/") {
    if (!isAuthenticated) {
      return <Navigate to="/auth/login" />;
    } else {
      if (user?.role === "admin") {
        console.log(
          "authenticated -admin and trying to go to login redirected again to admin"
        );
        return <Navigate to="/admin/dashboard" />;
      } else {
        console.log(
          "authenticated -user and trying to go to login redirected again to shop"
        );
        return <Navigate to="/shop/home" />;
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
    console.log(
      "you are not authenticated and your path name doesnt includes login and register"
    );
    return <Navigate to="/auth/login" />;
  }

  // 2. Authenticated user (not admin) tries to access admin
  if (
    isAuthenticated &&
    user?.role !== "admin" &&
    location.pathname.startsWith("/admin")
  ) {
    console.log(
      "authenticated -user and trying to go to admin redirected to unauth-page"
    );
    return <Navigate to="/unauth-page" />;
  }

  // 3. Admin tries to access shop
  if (
    isAuthenticated &&
    user?.role === "admin" &&
    location.pathname.startsWith("/shop")
  ) {
    console.log(
      "authenticated -admin and trying to go to shop redirected to admin"
    );
    return <Navigate to="/admin/dashboard" />;
  }

  // 4. Authenticated user on login/register
  if (
    isAuthenticated &&
    (location.pathname.includes("/login") ||
      location.pathname.includes("/register"))
  ) {
    if (user?.role === "admin") {
      console.log(
        "authenticated -admin and trying to go to login redirected again to admin"
      );
      return <Navigate to="/admin/dashboard" />;
    } else {
      console.log(
        "authenticated -user and trying to go to login redirected again to shop"
      );
      return <Navigate to="/shop/home" />;
    }
  }

  // 5. Otherwise, render children
  return <>{children}</>;
}

export default CheckAuth;
