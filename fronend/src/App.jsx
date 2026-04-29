import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "./features/auth/authThunks";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import UserDashboardPage from "./pages/Dashboard/UserDashboardPage";
import DashboardLayout from "./components/Layout/DashboardLayout";
import ProfilePage from "./pages/Profile/ProfilePage";

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);
  return (
    <Router>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#000",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            border: "1px solid #e2e8f0",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Dashboard Routes */}
        <Route path="/user-dashboard" element={<DashboardLayout />}>
          <Route index element={<UserDashboardPage />} />
        </Route>

        <Route path="/profile" element={<ProfilePage />} />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;