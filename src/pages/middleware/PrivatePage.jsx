import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function PrivatePage() {
  const isAuthenticated = localStorage.getItem("access_token");
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
